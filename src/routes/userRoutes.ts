import { Router } from "express";
import { createUser, getUsers } from "src/controllers/userController";
import { authMiddleware } from "src/middlewares/authMiddleware";
import { roleValidationMiddleware } from "src/middlewares/roleValidationMiddleware";

const router = Router();

router.get("/", authMiddleware, getUsers);
router.post("/", authMiddleware, roleValidationMiddleware, createUser);

export default router;