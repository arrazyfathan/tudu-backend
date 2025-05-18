import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ResponseError } from "../errors/response.error";
import { errorResponse } from "../utils/response";

export const errorMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};
    error.errors.forEach((e) => {
      if (e.path.length) {
        formattedErrors[e.path.join(".")] = e.message;
      }
    });
    res.status(400).json(errorResponse("Validation failed", formattedErrors));
  } else if (error instanceof ResponseError) {
    res.status(error.status).json(errorResponse(error.message));
  } else {
    res.status(500).json(errorResponse(error.message));
  }
};
