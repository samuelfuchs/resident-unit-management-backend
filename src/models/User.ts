import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  name: string;
  lastName: string;
  role: "admin" | "receptionist" | "resident";
  phone: string;
  address?: string;
  zipCode?: number;
  city?: string;
  state?: string;
  unitNumber?: string;
  createdAt?: Date;
  profilePicture?: string;
  status?: "active" | "inactive";
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "receptionist", "resident"],
      required: true,
    },
    phone: { type: String, required: true },
    address: { type: String },
    zipCode: { type: Number },
    city: { type: String },
    state: { type: String },
    unitNumber: { type: String },
    createdAt: { type: Date, default: Date.now },
    profilePicture: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: { type: String, required: true },
      },
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);