import { User, Book } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

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
  userId: string;
  bookId: string;
}

const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new AuthenticationError('Could not authenticate user.');
    },

    getUsers: async () => {
      return User.find().populate('savedBooks');
    },

    getUser: async (_parent: any, { username }: { username: string }) => {
      return User.findOne({ username }).populate('savedBooks');
    },

    getBook: async (_parent: any, { bookId }: { bookId: string }) => {
      return Book.findOne({ bookId });
    },
  },

  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      const user = await User.create({ ...input });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Could not authenticate user.');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Could not authenticate user.');
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    saveBook: async (_parent: any, { userId, bookId }: SaveBookArgs) => {
      return User.findByIdAndUpdate(
        userId,
        { $addToSet: { savedBooks: bookId } },
        { new: true }
      ).populate('savedBooks');
    },

    removeBook: async (_parent: any, { userId, bookId }: SaveBookArgs) => {
      return User.findByIdAndUpdate(
        userId,
        { $pull: { savedBooks: bookId } },
        { new: true }
      ).populate('savedBooks');
    },
  },
};

export default resolvers;
