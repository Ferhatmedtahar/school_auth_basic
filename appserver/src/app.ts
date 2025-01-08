import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { globalErrorHandler } from "./controllers/error.controller";

import apiRoutes from "./routes/index";
import { AppError } from "./utils/appError";
dotenv.config();

export const app = express();

app.use(helmet());

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use("/api/v1", apiRoutes);

//  ! handle the undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
