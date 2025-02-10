import { Router } from "express";
import {
  createPaymentIntent,
  getPaymentHistory,
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

export default router;
