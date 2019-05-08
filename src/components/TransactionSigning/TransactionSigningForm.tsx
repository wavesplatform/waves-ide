import * as React from 'react';
import TextField from '@material-ui/core/TextField/TextField';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import Button from '@material-ui/core/Button/Button';
import { StyledComponentProps, Theme } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import { IAccount } from '@stores';

const styles = (theme: Theme) => ({
    root: {
        width: '100%',
    },
    area: {
        borderWidth: '1px 0px 1px 0px',
        borderStyle: 'solid',
        borderColor: '#b0b0b0b0',
        marginTop: '20px',
        padding: '10px 0px 10px 0px'
    },
    signingRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        //alignItems: 'baseline'
    },
    selector: {
        maxWidth: '40%',
        //margin: '12 12 0 12'
    },
    seedTextField: {
        maxWidth: '40%'
    },
    signButton: {
        height: '50%'
    }
});

interface ITransactionSigningFormProps extends StyledComponentProps<keyof ReturnType<typeof styles>> {
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
    onSeedChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onAccountChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const TransactionSigningFormComponent = (
    {
        signType,
        onSignTypeChange,
        seed,
        onSeedChange,
        proofIndex,
        availableProofIndexes,
        onProofNChange,
        accounts,
        selectedAccount,
        onAccountChange,
        onSign,
        signDisabled,
        classes
    }: ITransactionSigningFormProps) => {

    const keeperEnabled = typeof window.Waves === 'object';
    return (
        <div className={classes!.root}>
            <div className={classes!.signingRow}>
                <TextField
                    className={classes!.selector}
                    label="SignWith"
                    name="SignWith"
                    select
                    required
                    value={signType}
                    onChange={onSignTypeChange}
                    style={{marginTop: 12, marginBottom: 12}}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="seed">Seed phrase</MenuItem>
                    <MenuItem value="account">IDE Account</MenuItem>
                    {keeperEnabled &&
                    <MenuItem value="wavesKeeper">WavesKeeper</MenuItem>}
                </TextField>
                {{
                    account:
                        <TextField
                            className={classes!.selector}
                            label="Account"
                            name="account"
                            select
                            required
                            value={selectedAccount}
                            onChange={onAccountChange}
                            disabled={availableProofIndexes.length === 0}
                            style={{marginTop: 12, marginBottom: 12}}
                            fullWidth
                            margin="normal"
                        >
                            {accounts.map((acc, i) => <MenuItem key={i} value={i}>{acc.label}</MenuItem>)}
                        </TextField>,
                    seed:
                        <TextField
                            className={classes!.seedTextField}
                            error={seed === ''}
                            //helperText={seed !== '' ? '' : 'Empty seed phrase'}
                            required
                            label={'Seed to sign'}
                            value={seed}
                            onChange={onSeedChange}
                            margin="normal"
                            fullWidth
                        />,
                    wavesKeeper: null
                }[signType]}
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <TextField
                    className={classes!.selector}
                    error={availableProofIndexes.length > 0 && !availableProofIndexes.includes(proofIndex)}
                    label="Proof Index"
                    name="N"
                    select
                    required
                    value={proofIndex}
                    onChange={onProofNChange}
                    disabled={availableProofIndexes.length === 0}
                    fullWidth
                    margin="normal"
                >
                    {availableProofIndexes.map((n => <MenuItem key={n} value={n}>{n.toString()}</MenuItem>))}
                </TextField>
                <Button
                    className={classes!.signButton}
                    variant="contained"
                    children="sign"
                    color="primary"
                    disabled={signDisabled}
                    onClick={onSign}
                />
            </div>
        </div>
    );
};

export default withStyles(styles as any)(TransactionSigningFormComponent);
