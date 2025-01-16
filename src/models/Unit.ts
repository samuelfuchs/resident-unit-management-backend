import mongoose, { Schema, Document } from "mongoose";

export interface UnitDocument extends Document {
  number: string;
  floor?: number;
  squareFootage: number;
  type: string;
  owner: mongoose.Types.ObjectId[];
  parkingSpots?: string[];
  tenant?: mongoose.Types.ObjectId[] | null;
}

const UnitSchema: Schema = new Schema(
  {
    number: { type: String, required: true },
    floor: { type: Number },
    squareFootage: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Residential", "Commercial", "House", "Apartment", "Office"],
      required: true,
    },
    owner: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    parkingSpots: [{ type: String }],
    tenant: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Unit = mongoose.model<UnitDocument>("Unit", UnitSchema);
export default Unit;
