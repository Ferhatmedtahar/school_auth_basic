export class AppError extends Error {
  isOperational: boolean;

  statusCode: number;

  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("5") ? "error" : "fail";
    this.isOperational = true;
    //  stack trace err.stack path where the error happend
    Error.captureStackTrace(this, this.constructor);
  }
}
