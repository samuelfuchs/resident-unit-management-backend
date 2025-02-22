import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  resident: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  dueDate: Date;
  status: "pending" | "paid" | "failed";
  paymentIntentId?: string;
  paidAt?: Date;
  paymentDetails?: {
    transactionId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    errorMessage?: string;
  };
}

const BillSchema = new Schema(
  {
    resident: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentIntentId: { type: String },
    paidAt: { type: Date },
    paymentDetails: {
      transactionId: String,
      amount: Number,
      currency: String,
      paymentMethod: String,
      errorMessage: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBill>("Bill", BillSchema);
