import express from "express";
import {
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/login", login);

export default router;
