import express from 'express';
import cors from 'cors'; // ✅ Import CORS middleware
import path from 'node:path';
import type { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { authenticateGraphQL } from './services/auth.js';
import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

// ✅ Apply CORS Middleware (Allow Frontend to Access API)
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend access
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow these headers
}));

const startApolloServer = async () => {
  await server.start();
  await db;

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // ✅ Apply CORS again specifically for GraphQL requests
  app.use('/graphql', cors<cors.CorsRequest>(), expressMiddleware(server, {
    context: async ({ req }: { req: Request }) => {
      const authContext = await authenticateGraphQL({ req });
      return authContext; // ✅ Returns `{ user: decodedUser }` or `{ user: null }`
    },
  }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`✅ API server running on port ${PORT}!`);
    console.log(`✅ GraphQL is available at http://localhost:${PORT}/graphql`);
  });
};

// Start the server
startApolloServer();
