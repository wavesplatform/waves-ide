import {createStandardAction} from 'typesafe-actions';

export const userNotification = createStandardAction('USER_NOTIFICATION')<string>();

