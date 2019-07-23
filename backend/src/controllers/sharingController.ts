import { NextFunction, Request, Response } from 'express';
import logger from '../util/logger';

export const getFile = (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Get file called');
};

export const saveFile = (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Save file called');
};
