import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "src/models/User";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];
  console.log("here");
  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as IUser;
    console.log("req", req);
    // req.user = decoded;
    next();
  } catch (err) {
    res;
  }
};
