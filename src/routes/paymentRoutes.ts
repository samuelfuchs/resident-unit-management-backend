import { Router } from "express";
import {
  createPaymentIntent,
  getPaymentHistory,
  cancelPayment,
  updatePayment,
  getUserPayments,
  handleWebhook,
  createResidentPaymentIntent,
} from "../controllers/paymentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminOnlyMiddleware } from "../middlewares/adminOnlyMiddleware";
import express from "express";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

router.post(
  "/create-payment-intent",
  authMiddleware,
  adminOnlyMiddleware,
  createPaymentIntent
);

router.get(
  "/payment-history",
  authMiddleware,
  adminOnlyMiddleware,
  getPaymentHistory
);

router.post(
  "/cancel/:paymentIntentId",
  authMiddleware,
  adminOnlyMiddleware,
  cancelPayment
);

router.put(
  "/update/:paymentIntentId",
  authMiddleware,
  adminOnlyMiddleware,
  updatePayment
);

router.get("/my-payments", authMiddleware, getUserPayments);

router.post(
  "/resident/create-payment-intent",
  authMiddleware,
  createResidentPaymentIntent
);

export default router;
