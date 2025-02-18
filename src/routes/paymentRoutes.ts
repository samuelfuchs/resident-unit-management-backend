import { Router } from "express";
import {
  createPaymentIntent,
  getPaymentHistory,
  cancelPayment,
  updatePayment,
  getUserPayments,
} from "../controllers/paymentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminOnlyMiddleware } from "../middlewares/adminOnlyMiddleware";

const router = Router();

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

export default router;
