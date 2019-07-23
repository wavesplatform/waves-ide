import express from 'express';
import * as sharingController from './controllers/sharingController';

const router = express.Router();


router.post('/saveFile', sharingController.saveFile);
router.get('/getFile/:file_id', sharingController.getFile);

export default router;
