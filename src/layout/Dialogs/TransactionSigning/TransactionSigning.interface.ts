import { RouteComponentProps } from 'react-router';

import {
    IAccount,
    AccountsStore,
    SettingsStore,
    SignerStore,
    UIStore,
    NotificationsStore
} from '@stores';

interface IInjectedProps {
    signerStore?: SignerStore
    accountsStore?: AccountsStore
    settingsStore?: SettingsStore
    notificationsStore?: NotificationsStore
    uiStore?: UIStore
}

export enum ESignType {
    ACCOUNT = 'account',
    EXCHANGE = 'exchange',
    LEDGER = 'ledger',
    SEED = 'seed',
    WAVES_KEEPER = 'wavesKeeper',
}

export interface ITransactionEditorProps extends IInjectedProps, RouteComponentProps { }

export interface ITransactionEditorState {
    editorValue: string
    proofIndex: number
    seed: string
    selectedAccount: number
    signType: ESignType
    isAwaitingConfirmation: boolean
}

export interface ITransactionSigningFormProps {
    signType: ESignType;
    onSignTypeChange: (v: string) => void;
    seed: string;
    availableProofIndexes: number[];
    proofIndex: number;
    accounts: IAccount[];
    selectedAccount: number;
    signDisabled: boolean;
    onSign: () => Promise<boolean>;
    onProofNChange: (v: string) => void;
    onSeedChange: (v: string) => void;
    onAccountChange: (v: string) => void;
    disableAwaitingConfirmation: () => void;
    isAwaitingConfirmation: boolean
}