import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { AppError } from "../utils/appError";

// err want to mark as operational so we create it from appError operational true not the mongoose generic  one
function handleCastErrorDB(err: mongoose.Error.CastError): AppError {
  const message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
}

function handleMongoDuplicate(err: any): AppError {
  const value = err.errmsg.match(/(["'])(\\?.)*\1/)[0];
  const message = `this ${value} already exist .Please use another value!`;
  return new AppError(message, 400);
}

function handleValidationError(err: mongoose.Error.ValidationError): AppError {
  const errors = Object.values(err.errors).map((el) => el.message);
  console.log(errors);

  const message = `invalid data input :${errors.join(". ")}
  `;

  return new AppError(message, 404);
}

//  the functions that are responsible to turn the error to apperror which we are prepared to

function handleJWTError() {
  return new AppError("Invalid token , please log in again!", 401);
}

function handleTokenExpire() {
  return new AppError("Your token had expired ! please log in again", 401);
}

/*


! the global handler


*/

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  //  default error bcs there are some error come without status code

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  //  DEVELOPMENT
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      err,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  //  PRODUCTION
  if (process.env.NODE_ENV === "production") {
    let errorApp = { ...err };
    //  errors from mongo db error
    if (err.name === "CastError") {
      errorApp = handleCastErrorDB(err);
    }
    if (err.name === "MongoServerError" && err.code === 11000) {
      errorApp = handleMongoDuplicate(err);
    }
    if (err.name === "ValidationError") {
      errorApp = handleValidationError(err);
    }
    if (err.name === "JsonWebTokenError") {
      errorApp = handleJWTError();
    }

    if (err.name === "TokenExpiredError") {
      errorApp = handleTokenExpire();
    }
    if (errorApp.isOperational) {
      //  OPERATIONAL ,trusted error : we can send to client, errors that we can define them
      res.status(errorApp.statusCode).json({
        status: errorApp.status,
        message: errorApp.message,
      });
    }

    //
    else {
      //  NON OPERATIONAL ERROR :error didnt create our selfs
      //  programming error or unknowen error , DONT LEAK ERROR DETAILS TO CLIENT
      console.error("ERROR 💥", err);
      res
        .status(500)
        .json({ status: "error", message: "Something went wrong" });
    }
  }
};
