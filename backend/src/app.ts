import express from 'express';
import compression from 'compression';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { MONGODB_URI } from './util/secrets';
import apiRouter from './api-routes';
import logger from './util/logger';

// db setup
const dbUri = MONGODB_URI || '';
const dbOptions: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    bufferMaxEntries: 0,
    reconnectInterval: 5000,
    reconnectTries: Number.MAX_VALUE
};
mongoose.connect(dbUri, dbOptions).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    },
).catch(err => {
    logger.error('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    // process.exit();
});


// Express configuration
const app = express();
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Set default API response
app.get('/', function (req, res) {
    res.json({
        status: 'API is working',
        message: 'Available at api/v1',
    });
});
app.use('/api/v1', apiRouter);

export default app;
