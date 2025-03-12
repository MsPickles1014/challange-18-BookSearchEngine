import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');

const db = mongoose.connection;

db.once("open", () => {
    console.log(`✅ Connected to MongoDB`);
  });

  db.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
  });

export default db;