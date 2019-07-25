import { RequestHandler, Request, Response, NextFunction } from 'express';

const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(e => next(e));

export default asyncHandler;
