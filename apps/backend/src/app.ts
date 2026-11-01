import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { clerkMiddleware, createClerkClient } from "@clerk/express";
import type { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// import routes v1
import { routeV1 } from './routes/index'
import { apiLimiter } from './middlewares/rateLimiters'

const app: Express = express();

const corsOptions = {
  origin: [
    "https://www.continuumblock.org",
    "https://continuum-block-official-web.vercel.app",
    "http://localhost:3000", // Local frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(clerkMiddleware());
app.use(apiLimiter);

// define the health check route
app.get('/healthz', async (req: Request, res: Response): Promise<void> => {
  try {
      // Check MongoDB connection status
      const mongoStatus: boolean = mongoose.connection.readyState === 1;

      // ToDo: Assuming checkRedisConnection returns a Promise that resolves to a boolean


      if (mongoStatus) {
          res.status(200).json({ status: 'healthy' });
      } else {
          res.status(503).json({ status: 'unhealthy' });
      }
  } catch (error: unknown) {
      // Typing error as unknown, which is safer in TypeScript
      const errorMessage: string = (error instanceof Error) ? error.message : 'Unknown error';
      res.status(503).json({ status: 'unhealthy', error: errorMessage });
  }
});


// testing api
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    succcess: true,
    message: "API is working",
  });
});

app.use(routeV1) // routing v1

// 404 — no route matched
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler — catches anything passed to next(err) and any
// error a route forgot to catch itself, so raw error objects/stack traces
// never leak to the client.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    next(err);
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ message: "Internal server error", error: message });
});

export default app;
