import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  residentId: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  dueDate: Date;
  status: "pending" | "paid" | "overdue";
  paymentIntentId?: string;
  createdBy: mongoose.Types.ObjectId;
  paidAt?: Date;
}

const BillSchema = new Schema(
  {
    residentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paymentIntentId: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IBill>("Bill", BillSchema);
