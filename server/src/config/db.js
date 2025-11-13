import mongoose from "mongoose";

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connect;
