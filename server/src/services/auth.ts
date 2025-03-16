import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("❌ Missing JWT_SECRET_KEY in environment variables");
}

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

// ✅ Authenticate GraphQL requests & extract user from token
export const authenticateGraphQL = async ({ req }: { req: Request }) => {
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '').trim();
  }

  console.log("🔹 Incoming Token:", token || "No Token");

  if (!token) {
    console.log("❌ No token found in request");
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { data: JwtPayload };
    console.log("✅ Token Verified:", decoded.data);
    return { user: decoded.data };
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Invalid Token:", err.message);
    } else {
      console.error("❌ Invalid Token: An unknown error occurred", err);
    }
    return { user: null };
  }
  
};

// ✅ Middleware: Authenticate token for REST API requests
export const authenticateToken = (req: Request, res?: Response, next?: NextFunction) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop()?.trim();
  }

  console.log("🔹 Middleware Incoming Token:", token || "No Token");

  if (!token) {
    if (res && next) {
      return res.status(401).json({ message: '❌ Unauthorized: Token required' });
    }
    return { user: null };
  }

  try {
    const { data }: any = jwt.verify(token, SECRET_KEY, { maxAge: '30d' });
    req.user = data as JwtPayload;

    if (next) {
      return next();  // ✅ Proceed in Express middleware
    }
    return { user: req.user };  // ✅ GraphQL response
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Token Verification Failed:", err.message);
    } else {
      console.error("❌ Token Verification Failed: Unknown error", err);
    }
    return { user: null };
  }
  
};

// ✅ Sign JWT Token for Users
export const signToken = (username: string, email: string, _id: unknown) => {
  if (!SECRET_KEY) {
    throw new Error("❌ JWT_SECRET_KEY is missing in .env file");
  }

  const payload = { username, email, _id };

  console.log("🔹 Generating Token for:", payload);

  return jwt.sign({ data: payload }, SECRET_KEY, { expiresIn: '30d' });
};

// ✅ Custom GraphQL Authentication Error
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: 'UNAUTHENTICATED' },
    });
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};
