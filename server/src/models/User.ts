import { Schema, model, type Document } from "mongoose";
import bcrypt from "bcrypt";

// Define the Book interface
export interface BookDocument extends Document {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image?: string;
  link?: string;
}

// Define the Book Schema as a subdocument
const bookSchema = new Schema<BookDocument>({
  bookId: { type: String, required: true},
  title: { type: String, required: true },
  authors: [{ type: String }],
  description: { type: String, required: true },
  image: { type: String },
  link: { type: String },
});

// Define the User interface
export interface UserDocument extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[];
  isCorrectPassword(password: string): Promise<boolean>;  // ✅ Added this method
}

// Define the User Schema
const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Must use a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  savedBooks: {
    type: [bookSchema],  // ✅ Embedded subdocument
    default: [],         
  },
});

// 🔹 Hash password before saving user
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});


userSchema.methods.isCorrectPassword = async function (password: string) {
  console.log("🔹 Comparing Input Password:", password);
  console.log("🔹 Stored Hashed Password:", this.password);

  const match = await bcrypt.compare(password, this.password);
  console.log("✅ Password Match Result:", match);

  return match;
};


const User = model<UserDocument>("User", userSchema);
export default User;
