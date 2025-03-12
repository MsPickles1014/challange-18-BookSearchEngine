// import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// import User from "./User";

// const MONGO_URI = "mongodb://127.0.0.1:27017/googlebooks"; // Update if needed

// async function updatePassword() {
//   await mongoose.connect(MONGO_URI); // ✅ No need for extra options in Mongoose 6+

//   const hashedPassword = await bcrypt.hash("NewPassword123", 10);

//   const result = await User.findOneAndUpdate(
//     { email: "johndoe@example.com" },
//     { password: hashedPassword }
//   );

//   console.log("✅ Password Updated:", result);
//   mongoose.disconnect();
// }

// updatePassword();
