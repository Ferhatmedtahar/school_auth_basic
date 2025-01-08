import { NextFunction, Request, Response } from "express";
//  ? this function replace the repeatetive try catch blocks .

export function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
