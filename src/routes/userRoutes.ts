import { Router } from "express";
import { getUsers, createUser } from "../controllers/UserController";
import { authMiddleware } from "src/middlewares/authMiddleware";
// import { authMiddleware } from "src/middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getUsers);
router.post("/", createUser);

export default router;