import mongoose from "mongoose";


const connectDB = async () => {
  const url = process.env.MONGO_URI
  try {
  if (!url) throw new Error
    await mongoose.connect(url);
    console.log("MongoDB connected...");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); 
  }
};

export default connectDB;