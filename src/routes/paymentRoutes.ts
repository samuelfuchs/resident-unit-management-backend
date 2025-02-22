import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createPaymentIntent,
  handleWebhook,
} from "../controllers/paymentController";

const router = express.Router();

router.post("/create-intent", authMiddleware, createPaymentIntent);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

export default router;
