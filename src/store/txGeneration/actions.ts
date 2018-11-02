import {createStandardAction} from 'typesafe-actions';

export const txGenerated = createStandardAction('TX_GENERATED')<string>();

