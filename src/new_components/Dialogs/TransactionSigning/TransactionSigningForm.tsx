import * as React from 'react';
import { IAccount } from '@stores';
import styles from './styles.less';
import classNames from 'classnames';

interface ITransactionSigningFormProps {
    signType: 'account' | 'seed' | 'wavesKeeper'
    onSignTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    seed: string;
    availableProofIndexes: number[];
    proofIndex: number;
    accounts: IAccount[];
    selectedAccount: number;
    signDisabled: boolean;
    onSign: (e: React.MouseEvent) => void;
    onProofNChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onSeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAccountChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default class TransactionSigningFormComponent extends React.Component<ITransactionSigningFormProps> {

    state = {
        justSigned: false
    };

    onSign = (e:  React.MouseEvent) => {
        this.props.onSign(e);
        this.setState({justSigned: true});
    }

    render(): React.ReactNode {
        const keeperEnabled = typeof window.Waves === 'object';
        const {
            signType, onSignTypeChange, seed, onSeedChange, proofIndex, availableProofIndexes,
            onProofNChange, accounts, selectedAccount, onAccountChange, signDisabled,
        } = this.props;
        const {justSigned} = this.state;
        return (
            <>
                <div className={styles.signing_field}>
                    <div className={styles.signing_title}>Sign with</div>
                    <select
                        name="SignWith"
                        className={styles.signing_input}
                        required
                        value={signType}
                        onChange={onSignTypeChange}
                    >
                        <option value="seed">Seed phrase</option>
                        <option value="account">IDE Account</option>
                        {keeperEnabled &&
                        <option value="wavesKeeper">WavesKeeper</option>}
                    </select>
                </div>
                <div className={styles.signing_field}>
                    {{
                        account: <>
                            <div className={styles.signing_title}>Account</div>
                            <select
                                className={styles.signing_input}
                                required
                                value={selectedAccount}
                                onChange={onAccountChange}
                                disabled={availableProofIndexes.length === 0}
                            >
                                {accounts.map((acc, i) => <option key={i} value={i}>{acc.label}</option>)}
                            </select>
                        </>,
                        seed: <>
                            <div className={styles.signing_title}>Seed to sign</div>
                            <input
                                className={classNames(styles.signing_input, seed === '' && styles.signing_input_error)}
                                value={seed}
                                onChange={onSeedChange}
                                required
                            />
                        </>,
                        wavesKeeper: <>
                            <div className={styles.signing_title}/>
                            <input className={styles.signing_input} disabled/>
                        </>
                    }[signType]}
                </div>
                <div className={styles.signing_field}>
                    <div className={styles.signing_title}>Proof index</div>
                    <select
                        className={classNames(styles.signing_inputSmall,
                            availableProofIndexes.length > 0
                            && !availableProofIndexes.includes(proofIndex)
                            && styles.signing_input_error)
                        }
                        name="N"
                        required
                        value={proofIndex}
                        onChange={onProofNChange}
                        disabled={availableProofIndexes.length === 0}
                    >
                        {availableProofIndexes
                            .map((n => <option key={n} value={n}>{(n + 1).toString()}</option>))
                        }
                    </select>
                </div>
                <div className={styles.signing_buttonField}>

                   {
                       <button
                        className={styles[`signing_button${justSigned ? '-added' : ''}`]}
                        disabled={signDisabled }
                        onClick={justSigned ? () => this.setState({justSigned: false}) : this.onSign}
                        onBlur={() => this.setState({justSigned: false})}
                    >
                        <div className={justSigned ? styles.check : styles.plus}/>
                        {justSigned ? 'Sign added' : 'Add sign'}
                    </button>}
                </div>
            </>
        );
    }
}
