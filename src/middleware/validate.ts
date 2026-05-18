import { ZodTypeAny } from "zod";
import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

type Schema = ZodTypeAny;

export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      return sendError(res, "Validation failed", "VALIDATION_ERROR", 400);
    }

    const parsedData = parsed.data as { body: Request["body"]; params: Request["params"]; query: Request["query"] };
    req.body = parsedData.body;
    req.params = parsedData.params;
    req.query = parsedData.query;
    return next();
  };
}
