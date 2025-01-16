import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import unitRoutes from "./routes/unitRoutes";
import connectDB from "./config/db";
import cors from "cors";

dotenv.config();

const app: Express = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "https://roger-residencia.netlify.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", unitRoutes);

connectDB();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
// server.keepAliveTimeout = 120 * 1000;
// server.headersTimeout = 120 * 1000;  
//  "email": "admin2@example.com",
// "password": "password123",