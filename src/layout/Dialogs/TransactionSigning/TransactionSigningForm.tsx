import * as React from 'react';
import Select from '@src/components/Select';
import Input from '@components/Input';

import styles from './styles.less';
import { WaitForWavesKeeper } from './WaitForWavesKeeper';
import {
    ESignType,
    ITransactionSigningFormProps,
} from './TransactionSigning.interface';

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
        const signOptions = [
            { value: ESignType.SEED, title: 'Seed phrase' },
            { value: ESignType.ACCOUNT, title: 'IDE Account' },
            { value: ESignType.EXCHANGE, title: 'waves.exchange' },
            { value: ESignType.LEDGER, title: 'Ledger' },
        ];

        const {
            availableProofIndexes,
            signType,
            proofIndex,
            signDisabled,
            isAwaitingConfirmation,
            disableAwaitingConfirmation,
            onSignTypeChange,
            onProofNChange,
        } = this.props;

        const {justSigned} = this.state;

        if (keeperEnabled) {
            signOptions.push({value: ESignType.WAVES_KEEPER, title: 'Waves Keeper'});
        }

        return isAwaitingConfirmation
            ? <WaitForWavesKeeper
                onCancel={disableAwaitingConfirmation}
            />
            : (
                <div className={styles.signingForm}>
                    <div className={styles.signing_field}>
                        <div className={styles.signing_title}>Sign with</div>
                        <Select
                            options={signOptions}
                            name="SignWith"
                            className={styles.signing_select}
                            required={true}
                            value={signType}
                            onChange={onSignTypeChange}
                        />
                    </div>
                    <div className={styles.signing_field}>
                        {this.renderOptionBySignType(signType)}
                    </div>
                    <div className={styles.signing_field}>
                        <div className={styles.signing_title}>Proof index</div>
                        <Select options={availableProofIndexes.map((n => ({title: n + 1, value: n})))}
                                onChange={onProofNChange}
                                required={true}
                                name="N"
                                disabled={availableProofIndexes.length === 0}
                                value={proofIndex}
                                className={styles.signing_selectSmall}
                                invalid={
                                    availableProofIndexes.length > 0 && !availableProofIndexes.includes(proofIndex)
                                }
                        />
                    </div>
                    <div className={styles.signing_buttonField}>
                        {
                            justSigned
                            ? (
                                <button
                                    className={styles['signing_button-added']}
                                    disabled={signDisabled}
                                    onClick={() => this.setState({justSigned: false})}
                                    onBlur={() => this.setState({justSigned: false})}
                                >
                                    <div className={styles.check}/>
                                    <span>Sign added</span>
                                </button>
                            )
                            : (
                                <button
                                    className={styles['signing_button']}
                                    disabled={signDisabled}
                                    onClick={this.onSign}
                                    onBlur={() => this.setState({justSigned: false})}
                                >
                                    <div className={styles.plus}/>
                                    <span>Add sign</span>
                                </button>
                            )
                        }
                    </div>
                </div>
            );
    }

    renderOptionBySignType(signType: ESignType) {
        const { accounts, availableProofIndexes, selectedAccount, onAccountChange, seed } = this.props;

        switch (signType) {
            case ESignType.ACCOUNT:
                return (
                    <>
                        <div className={styles.signing_title}>Account</div>
                        <Select
                            className={styles.signing_select}
                            required={true}
                            value={accounts.length !== 0 ? selectedAccount : undefined}
                            onChange={onAccountChange}
                            disabled={availableProofIndexes.length === 0}
                            options={accounts.map((acc, i) => ({title: acc.label, value: i}))}
                        />
                    </>
                );

            case ESignType.EXCHANGE:
                return (
                    <>
                        <div className={styles.signing_title}/>
                        <div className={styles.signing_input}/>
                    </>
                );

            case ESignType.LEDGER:
                return (
                    <>
                        <div className={styles.signing_title}></div>
                        <div className={styles.signing_input}></div>
                    </>
                );

            case ESignType.SEED:
                return (
                    <>
                        <div className={styles.signing_title}>Seed to sign</div>
                        <Input
                            invalid={seed === ''}
                            value={seed}
                            onChange={this.onSeedChange}
                            className={styles.signing_input}
                        />
                    </>
                );

            case ESignType.WAVES_KEEPER:
                return (
                    <>
                        <div className={styles.signing_title}/>
                        <div className={styles.signing_input}/>
                    </>
                );

        }
    }
}
