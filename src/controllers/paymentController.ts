import { Request, Response } from "express";
import { stripe } from "../config/stripe";

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, userId, description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      description,
      metadata: {
        userId,
        adminId: req.user.id,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
    });
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
