// auth.ts 

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

// ✅ Authenticate GraphQL requests and extract user
export const authenticateGraphQL = async ({ req }: { req: Request }) => {
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '').trim();
  }

  if (!token) {
    console.log("❌ No token found in request");
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { data: JwtPayload };
    console.log("✅ Token verified. User:", decoded.data);
    return { user: decoded.data };
  } catch (err) {
    console.error("❌ Invalid token:", err);
    return { user: null };
  }
};

export const authenticateToken = (req: Request, res?: Response, next?: NextFunction) => {
  // allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    if (res && next) {
      return res.status(401).json({ message: 'Unauthorized: Token required' });
    }
    return { user: null };
  }

  try {
    const { data }: any = jwt.verify(token, SECRET_KEY, { maxAge: '2h' });
    req.user = data as JwtPayload;

    if (next) {
      return next();  // ✅ Express API continues execution
    }
    return { user: req.user };  // ✅ GraphQL returns `{ user }`
  } catch (err) {
    if (res && next) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    return { user: null };  // ✅ GraphQL-style response for invalid token
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey: any = process.env.JWT_SECRET_KEY;

  return jwt.sign({data: payload}, secretKey, { expiresIn: '30d' });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' })
  }
};