import User from "../models/User.js";
import { signToken, AuthenticationError } from "../services/auth.js";

interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  };
}

interface LoginUserArgs {
  email: string;
  password: string;
}

interface SaveBookArgs {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
}

const resolvers = {
  Query: {
    getUsers: async () => {
      return User.find().populate("savedBooks");
    },

    getUser: async (_parent: any, { username }: { username: string }) => {
      return User.findOne({ username }).populate("savedBooks");
    },

    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError("Could not authenticate user.");
    },
  },

  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      console.log("📌 Creating a new user:", input);

      // ✅ Create user with plain text password (Not Secure!)
      const user = await User.create({
        username: input.username,
        email: input.email,
        password: input.password, // ⚠️ Plaintext password (Not Secure!)
      });

      console.log("✅ User created successfully:", user);

      // ✅ Generate token
      const token = signToken(user.username, user.email, user._id);

      console.log("🔑 Token generated:", token);

      return { token, user };
    },

    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      console.log(`📌 Checking login for email: ${email}`);

      const user = await User.findOne({ email });

      if (!user) {
        console.log("❌ User not found!");
        throw new AuthenticationError("Could not authenticate user.");
      }

      console.log("✅ User found:", user.username);
      console.log("🔹 Stored Password:", user.password);
      console.log("🔹 Input Password:", password);

      // ✅ Compare plaintext passwords
      if (user.password !== password) {
        console.log("❌ Incorrect password!");
        throw new AuthenticationError("Incorrect password.");
      }

      console.log("✅ Password match!");

      // ✅ Generate and return token
      const token = signToken(user.username, user.email, user._id);

      console.log("🔑 Token generated:", token);

      return { token, user };
    },

    saveBook: async (_parent: any, { input }: { input: SaveBookArgs }, context: any) => {
      if (!context.user) {
        console.log("❌ No user found in context. Authentication failed.");
        throw new AuthenticationError("You need to be logged in to save a book.");
      }

      console.log("📌 `saveBook` Mutation Called");
      console.log("📌 User:", context.user);
      console.log("📌 Book to save:", input);

      try {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: input } }, // ✅ Prevents duplicate books
          { new: true, runValidators: true }
        ).populate("savedBooks");

        if (!updatedUser) {
          console.log("❌ User not found in database.");
          throw new Error("User not found.");
        }

        console.log("✅ Book saved successfully:", updatedUser.savedBooks);
        return updatedUser;
      } catch (error) {
        console.error("❌ Error saving book:", error);
        throw new Error("Failed to save book.");
      }
    },

    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to remove a book.");
      }
      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate("savedBooks");
    },
  },
};

export default resolvers;
