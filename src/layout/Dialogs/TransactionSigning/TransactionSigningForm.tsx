import * as React from 'react';
import { IAccount } from '@stores';
import Select from '@src/components/Select';
import Button from '@src/components/Button';
import styles from './styles.less';
import classNames from 'classnames';
import Input from '@components/Input';

interface ITransactionSigningFormProps {
    signType: 'account' | 'seed' | 'wavesKeeper' | 'exchange';
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
    isAwaitingConfirmation: boolean;
    deleteProof: () => void;
}

export default class TransactionSigningFormComponent extends React.Component<ITransactionSigningFormProps> {

    state = {
        justSigned: false
    };

    onSign = async () => {
        if (await this.props.onSign()) this.setState({justSigned: true});
    };

    onSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => this.props.onSeedChange(e.target.value);


    render(): React.ReactNode {
        const keeperEnabled = typeof window.Waves === 'object';
        const {
            signType, onSignTypeChange, seed, proofIndex, availableProofIndexes, disableAwaitingConfirmation,
            onProofNChange, accounts, selectedAccount, onAccountChange, signDisabled, isAwaitingConfirmation,
            deleteProof
        } = this.props;
        const signOptions = [{value: 'seed', title: 'Seed phrase'}, {
            value: 'account',
            title: 'IDE Account'
        }, {value: 'exchange', title: 'waves.exchange'}];
        if (keeperEnabled) signOptions.push({value: 'wavesKeeper', title: 'Waves Keeper'});
        const {justSigned} = this.state;
        return isAwaitingConfirmation
            ? <WaitForWavesKeeper
                onCancel={disableAwaitingConfirmation}
            />
            : (
                <div className={styles.signingForm}>
                    <div className={styles.signingField}>
                        <div className={styles.signingTitle}>Sign with</div>
                        <Select
                            options={signOptions}
                            name="SignWith"
                            className={styles.signingSelect}
                            required={true}
                            value={signType}
                            onChange={onSignTypeChange}
                        />
                    </div>
                    <div className={styles.signingField}>
                        {{
                            account: <>
                                <div className={styles.signingTitle}>Account</div>
                                <Select
                                    className={styles.signingSelect}
                                    required={true}
                                    value={accounts.length !== 0 ? selectedAccount : undefined}
                                    onChange={onAccountChange}
                                    disabled={availableProofIndexes.length === 0}
                                    options={accounts.map((acc, i) => ({title: acc.label, value: i}))}
                                />
                            </>,
                            seed: <>
                                <div className={styles.signingTitle}>Seed to sign</div>
                                <Input
                                    invalid={seed === ''}
                                    value={seed}
                                    onChange={this.onSeedChange}
                                    className={styles.signingInput}
                                />
                            </>,
                            wavesKeeper: <>
                                <div className={styles.signingTitle}/>
                                <div className={styles.signingInput}/>
                            </>,
                            exchange: <>
                                <div className={styles.signingTitle}/>
                                <div className={styles.signingInput}/>
                            </>
                        }[signType]}
                    </div>
                    <div className={styles.signingField}>
                        <div className={styles.signingTitle}>Proof index</div>
                        <Select options={availableProofIndexes.map((n => ({title: n + 1, value: n})))}
                                onChange={onProofNChange}
                                required={true}
                                name="N"
                                disabled={availableProofIndexes.length === 0}
                                value={proofIndex}
                                className={styles.signingSelectSmall}
                                invalid={
                                    availableProofIndexes.length > 0 && !availableProofIndexes.includes(proofIndex)
                                }
                        />
                    </div>

                    <div className={styles.signingField}>
                        <div className={styles.signingTitle}>Delete proof</div>
                        {<button
                            className={styles.delete_proofs}
                            disabled={signDisabled}
                            onClick={deleteProof}
                        >
                            <div className={styles.delete_icon}/>
                        </button>}
                    </div>

                    <div className={styles.signingButtonField}>
                        {<button
                            className={styles[`signing_button${justSigned ? '-added' : ''}`]}
                            disabled={signDisabled}
                            onClick={justSigned ? () => this.setState({justSigned: false}) : this.onSign}
                            onBlur={() => this.setState({justSigned: false})}
                        >
                            <div className={justSigned ? styles.check : styles.plus}/>
                            {justSigned ? 'Sign added' : 'Add sign'}
                        </button>}
                    </div>
                </div>
            );
    }
}

const WaitForWavesKeeper = ({onCancel}: { onCancel: () => void }) =>
    <div className={styles.signingWaitKeeperRoot}>
        <div className={styles.signingWaitKeeperText}>
            <div className={styles.signingTitleBlue}>Waiting for confirmation</div>
            <div className={styles.signingLoading}>Loading...</div>
        </div>
        <Button className={styles.signingWaitKeeperBtn} onClick={onCancel}>Cancel</Button>
    </div>;
