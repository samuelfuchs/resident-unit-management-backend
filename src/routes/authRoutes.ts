import express from "express";
import { signup, login } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", login);

export default router;
