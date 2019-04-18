import * as AJV from 'ajv';
import { Request, Response, NextFunction } from 'express';

export type HttpStatusSuccess = 200 | 201 | 202 | 204;
export type HttpStatusError = 400 | 401 | 402 | 403 | 404 | 405 | 409 | 410 | 500 | 501 | 502 | 503 | 504;
export type HttpStatus = HttpStatusSuccess | HttpStatusError;

export interface HandlerResponse<T> {
  success(data: T, status?: HttpStatusSuccess): void;
  error(data: any, status?: HttpStatusError): void;
}

export function validateSchema(schema: any) {
  const validate = new AJV({ allErrors: true }).compile(schema);

  return (req: Request & any, res: Response & any, next: NextFunction) => {
    req.data = Object.assign(req.query, req.params, req.body);

    if (validate && !validate(req.data)) {
      return res.error(
        {
          error: 'REQUEST_DOESNT_MATCH_SCHEMA',
          errors: validate.errors,
        },
        400
      );
    }

    next();
  };
}

export function ResponseHandlerMiddleWare(req: Request & any, res: Response & any, next: NextFunction) {
  res.success = (data: any, status: HttpStatusSuccess = 200) => res.status(status).send(data);
  res.error = (data: any, status: HttpStatusError = 500) => res.status(status).send(data);

  next();
}
