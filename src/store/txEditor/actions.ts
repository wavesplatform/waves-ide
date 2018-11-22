import {createStandardAction} from 'typesafe-actions';

export const txGenerated = createStandardAction('TX_GENERATED')<string>();
export const txChanged = createStandardAction('TX_CHANGED')<string>();

