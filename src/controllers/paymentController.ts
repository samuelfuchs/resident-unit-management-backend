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
