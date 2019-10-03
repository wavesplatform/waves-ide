import { applyMiddleware } from 'redux';

import saveToStorage from './saveToStorage';
import syncIframeEnv from './syncIframeEnv';

export default applyMiddleware(saveToStorage, syncIframeEnv);
