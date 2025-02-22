import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import Stripe from "stripe";
import Bill from "../models/Bill";
import { StatusCodes } from "http-status-codes";
import { IBill } from "../models/Bill";

export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { billId } = req.body;

    const bill = (await Bill.findOne({
      _id: billId,
      resident: req.user.id,
      status: "pending",
    }).lean()) as IBill;

    if (!bill) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Bill not found or already paid",
      });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(bill.amount * 100),
      currency: "usd",
      metadata: {
        billId: (bill._id as string).toString(),
        residentId: req.user.id,
        description: bill.description,
      },
    });

    bill.paymentIntentId = paymentIntent.id;
    await Bill.findByIdAndUpdate(bill._id, {
      paymentIntentId: paymentIntent.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error creating payment intent",
    });
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"];

  try {
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      res.status(400).send("Missing signature or webhook secret");
      return;
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPayment(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleFailedPayment(failedPaymentIntent);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

async function handleSuccessfulPayment(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    const bill = await Bill.findOne({ paymentIntentId: paymentIntent.id });
    if (!bill) {
      console.error(`No bill found for payment intent: ${paymentIntent.id}`);
      return;
    }

    await Bill.findByIdAndUpdate(bill._id, {
      status: "paid",
      paidAt: new Date(),
      paymentDetails: {
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method_types[0],
      },
    });
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

async function handleFailedPayment(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    const bill = await Bill.findOne({ paymentIntentId: paymentIntent.id });
    if (!bill) {
      console.error(`No bill found for payment intent: ${paymentIntent.id}`);
      return;
    }

    await Bill.findByIdAndUpdate(bill._id, {
      status: "failed",
      paymentDetails: {
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method_types[0],
        errorMessage: paymentIntent.last_payment_error?.message,
      },
    });
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const paymentIntents = await stripe.paymentIntents.search({
      query: `metadata['adminId']:'${req.user.id}'`,
      limit: 100,
    });

    res.status(200).json(paymentIntents.data);
  } catch (error) {
    console.error("Payment history fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch payment history",
    });
  }
};

export const cancelPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    res.status(200).json({
      status: paymentIntent.status,
      message: "Payment canceled successfully",
    });
  } catch (error) {
    console.error("Payment cancellation error:", error);
    res.status(500).json({
      error: "Failed to cancel payment",
    });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;
    const { amount, description } = req.body;

    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      ...(amount && { amount: Math.round(amount * 100) }),
      ...(description && { description }),
    });

    res.status(200).json(paymentIntent);
  } catch (error) {
    console.error("Payment update error:", error);
    res.status(500).json({
      error: "Failed to update payment",
    });
  }
};

export const getUserPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const limitNumber = parseInt(limit as string, 10);

    const paymentIntents = await stripe.paymentIntents.search({
      query: `metadata['userId']:'${req.user.id}'`,
      limit: limitNumber,
    });

    if (!paymentIntents.data || paymentIntents.data.length === 0) {
      res.status(200).json({
        payments: [],
        totalPayments: 0,
        message: "No payments found for this user",
      });
      return;
    }

    res.status(200).json({
      payments: paymentIntents.data,
      hasMore: paymentIntents.has_more,
    });
  } catch (error) {
    console.error("User payments fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch user payments",
    });
  }
};

export const createResidentPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      description,
      metadata: {
        userId: req.user.id,
        userRole: req.user.role,
        billId: req.body.billId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Resident payment intent creation error:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
    });
  }
};
