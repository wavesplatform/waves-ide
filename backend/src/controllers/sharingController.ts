import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import R from 'ramda';
import { check, sanitize, validationResult, body } from 'express-validator';
import { SharedFile, ISharedFileDocument } from '../models/SharedFile';
import logger from '../util/logger';
import asyncHandler from '../util/async-handler';

export const getFile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Get file called');
    const fileId = req.params.file_id;
    const file = await SharedFile.findById(fileId);
    if (file !== null) {
        res.json(R.pick(['content', 'hash', 'type'], file));
    } else {
        next();
    }
});

export const saveFile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Save file called');
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({errors: errors.array()});
        return;
    }
    const hash = sha256(req.body.type + req.body.content);

    let f = await SharedFile.findOne({hash});
    if (f == null) {
        f = await SharedFile.create({
            content: req.body.content,
            type: req.body.type,
            hash
        });
    }

    res.send(f._id);
});

export const validate = (method: string) => {
    switch (method) {
        case 'saveFile':
            return [
                body('type', 'File type should be ride or js').isIn(['js', 'ride']),
                body('content', 'Content should be string').isString()
            ];
        default:
            return [];
    }
};

const sha256 = (input: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(input, 'utf8');
    return hash.digest().toString('hex');
};
