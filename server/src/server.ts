import express, { Request, Response } from 'express'; // ✅ Removed unused NextFunction
import cors from 'cors'; // ✅ Import CORS middleware
import path from 'node:path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware, ExpressContextFunctionArgument } from '@apollo/server/express4';
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

  // ✅ Fix: Ensure correct `context` function type
  app.use('/graphql', expressMiddleware(server, {
    context: async (context: ExpressContextFunctionArgument) => {
      const { req } = context; // ✅ Correctly extract `req`
      return authenticateGraphQL({ req }); // ✅ Ensures correct return type
    },
  }) as express.RequestHandler); // ✅ Explicitly cast as `RequestHandler`

  if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use(express.static(path.join(__dirname, '../client/dist')));

    
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
