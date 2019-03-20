import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { transfer } from '@waves/waves-transactions';
import { validateAddress, validatePublicKey } from '@utils/validators';
import { SignerStore } from '@stores';
import { inject, observer } from 'mobx-react';

interface IInjectedProps {
    signerStore?: SignerStore
}

interface ITxGeneratorProps extends IInjectedProps, RouteComponentProps {
}

interface ITxGeneratorState {
    recipient: string
    assetId: string
    amount: number
    senderPublicKey: string
    scripted: boolean
}

@inject('signerStore')
@observer
class TxGeneratorDialogComponent extends React.Component<ITxGeneratorProps, ITxGeneratorState> {
    state = {
        recipient: '',
        assetId: '',
        senderPublicKey: '',
        amount: 0,
        scripted: false
    };

    handleClose = () => {
        const {history} = this.props;
        history.push('/');
    };

    handleGenerate = () => {
        const {recipient, amount, assetId, scripted, senderPublicKey} = this.state;
        const {history, signerStore} = this.props;
        try {
            const txParams = {
                recipient,
                amount,
                assetId,
                //Todo: Temporary. Library cannot create tx without public key
                senderPublicKey: senderPublicKey || 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr',
                fee: scripted ? 500000 : 100000
            };
            const tx = transfer(txParams);
            if (senderPublicKey === '') {
                delete tx.senderPublicKey;
                delete tx.id;
            }
            const txJson = JSON.stringify(tx, null, 2);
            signerStore!.setTxJson(txJson);
            history.push('/signer');
        } catch (e) {
            console.log(e);
        }

    };

    handleChange = (key: transferFormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        switch (key) {
            case 'recipient':
            case 'assetId':
            case 'senderPublicKey':
                this.setState({[key]: e.target.value} as any);
                break;
            case 'amount':
                const amount = +e.target.value;
                this.setState({amount: amount >= 0 ? amount : 0});
                break;
            case 'scripted':
                this.setState({scripted: !!e.target.value});
                break;
        }
    };

    render() {
        const {recipient, amount, assetId, scripted, senderPublicKey} = this.state;


        const disabled = (assetId.length > 0 && !validatePublicKey(assetId)) ||
            (senderPublicKey.length > 0 && !validatePublicKey(senderPublicKey)) ||
            amount <= 0;
        return (
            <Dialog open fullWidth maxWidth="md">
                <DialogTitle children="Transfer transaction"/>
                <DialogContent>
                    <TransferTxForm
                        {...this.state}
                        handleChange={this.handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        children="close"
                        color="secondary"
                        onClick={this.handleClose}
                    />
                    <Button
                        variant="contained"
                        children="generate"
                        color="primary"
                        disabled={disabled}
                        onClick={this.handleGenerate}
                    />
                </DialogActions>
            </Dialog>
        );
    }
}

interface ITransferTxFormProps {
    recipient: string
    assetId: string
    senderPublicKey: string
    amount: number
    scripted: boolean
    handleChange: (key: transferFormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

type transferFormFields = Exclude<keyof ITransferTxFormProps, 'handleChange'>;

const TransferTxForm = (
    {
        recipient, assetId, amount, scripted, senderPublicKey, handleChange
    }: ITransferTxFormProps) => (
    <div>
        <TextField
            helperText={assetId.length > 0 && !validatePublicKey(assetId) ? 'Invalid assetId' : ''}
            error={assetId.length > 0 && !validatePublicKey(assetId)}
            label={'Asset Id (leave blank for WAVES)'}
            value={assetId}
            onChange={handleChange('assetId')}
            fullWidth
            style={{marginTop: 6, marginBottom: 12}}
        />
        <TextField
            helperText={senderPublicKey.length > 0 && !validatePublicKey(senderPublicKey) ? 'Invalid public key' : ''}
            error={senderPublicKey.length > 0 && !validatePublicKey(senderPublicKey)}
            label="Sender public key (leave blank if you want to derive it from signer)"
            value={senderPublicKey}
            onChange={handleChange('senderPublicKey')}
            fullWidth
        >
        </TextField>
        {}
        <TextField
            error={!validateAddress(recipient)}
            helperText={!validateAddress(recipient) ? 'Invalid address' : ''}
            required
            label={'Recipient'}
            value={recipient}
            onChange={handleChange('recipient')}
            fullWidth
            style={{marginTop: 12, marginBottom: 12}}
        />
        <TextField
            error={amount === 0}
            helperText={amount === 0 ? 'Amount cannot be 0' : ''}
            required
            type="number"
            label={'Amount in decimal units (1 WAVES = 100000000)'}
            value={amount}
            onChange={handleChange('amount')}
            fullWidth
            style={{marginTop: 12, marginBottom: 12}}
        />
        <TextField
            //error={availableProofIndexes.length > 0 && !availableProofIndexes.includes(proofIndex)}
            label="Scripted (used to calculate fee)"
            select
            required
            value={scripted ? 1 : 0}
            onChange={handleChange('scripted')}
            fullWidth
        >
            <MenuItem value={0} children="No"/>
            <MenuItem value={1} children="Yes"/>
        </TextField>
    </div>
);

export const TxGeneratorDialog = withRouter(TxGeneratorDialogComponent);
