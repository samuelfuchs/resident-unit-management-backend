import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import connectDB from "./config/db";
import cors from "cors";

dotenv.config();

const app: Express = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//  "email": "admin2@example.com",
// "password": "password123",