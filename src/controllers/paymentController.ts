import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import Stripe from "stripe";
import Bill from "../models/Bill";

export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, userId, description } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      description,
      metadata: {
        userId,
        adminId: req.user.id,
      },
      // Add automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
    });
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res
      .status(400)
      .json({ error: "Missing stripe signature or webhook secret" });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update associated bill if it exists
        if (paymentIntent.metadata.billId) {
          await Bill.findByIdAndUpdate(paymentIntent.metadata.billId, {
            status: "paid",
            paymentIntentId: paymentIntent.id,
            paidAt: new Date(),
          });
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(400).json({ error: "Webhook signature verification failed" });
  }
};

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
