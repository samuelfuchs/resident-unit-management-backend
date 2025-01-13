import express from "express";
import {
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { passwordResetRateLimiter } from "src/middlewares/rateLimiter";

const router = express.Router();

router.post("/forgot-password", passwordResetRateLimiter, forgotPassword);
router.post("/reset-password/:token", passwordResetRateLimiter, resetPassword);
router.post("/login", login);

export default router;
