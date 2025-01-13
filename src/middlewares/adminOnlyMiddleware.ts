import { Request, Response, NextFunction } from "express";

export const adminOnlyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin") {
    res
      .status(403)
      .json({ message: "Access denied. Only admins can perform this action." });
    return;
  }
  next();
};
