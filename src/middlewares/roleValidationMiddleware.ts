import { Request, Response, NextFunction } from "express";

export const roleValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  const loggedInUserRole = req.user.role;
  const intendedRole = req.body.role;
  console.log("loggedInUserRole", loggedInUserRole);
  if (loggedInUserRole === "resident") {
    res.status(403).json({ message: "Residents cannot create new users." });
    return;
  }

  if (loggedInUserRole === "receptionist" && intendedRole === "admin") {
    res
      .status(403)
      .json({ message: "Receptionists cannot create admin users." });
    return;
  }

  next();
};
