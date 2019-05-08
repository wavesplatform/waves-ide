import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { compile } from '@waves/ride-js';
import { UserDialog } from './UserDialog';
import { multisig } from '../contractGenerators';
import { broadcast, libs, setScript } from '@waves/waves-transactions';
import MonacoEditor from 'react-monaco-editor';
import { copyToClipboard } from '@utils/copyToClipboard';
import Typography from '@material-ui/core/Typography/Typography';
import { networks } from '../constants';
import { validatePublicKey } from '@utils/validators';
import { FilesStore, NotificationsStore, FILE_TYPE } from '@stores';
import { inject, observer } from 'mobx-react';

interface IInjectedProps {
    notificationsStore?: NotificationsStore
    filesStore?: FilesStore
}

interface IWizardDialogProps extends IInjectedProps,
    RouteComponentProps {
}


interface IWizardState {
    publicKeys: string[]
    M: number,
    activeStep: number
    deployNetwork: 'mainnet' | 'testnet'
    deploySecretType: 'Private key' | 'Seed phrase',
    deploySecret: string
}

@inject('notificationsStore', 'filesStore')
@observer
class WizardDialogComponent extends React.Component<IWizardDialogProps, IWizardState> {

    public state: IWizardState = {
        publicKeys: [''],
        M: 1,
        activeStep: 0,
        deployNetwork: 'testnet',
        deploySecretType: 'Seed phrase',
        deploySecret: ''
    };

    setM = (event: any) => {
        this.setState({M: event.target.value});
    };

    addPublicKey = () => {
        const {publicKeys} = this.state;
        if (publicKeys.length < 8) {
            publicKeys.push('');
        }
        this.setState({publicKeys});
    };

    updatePublicKey = (index: number) => (event: any) => {
        const {publicKeys} = this.state;
        publicKeys[index] = event.target.value;
        this.setState({publicKeys});
    };

    removePublicKey = (index: number) => () => {
        let {publicKeys, M} = this.state;
        publicKeys.splice(index, 1);
        if (publicKeys.length < M) {
            M = publicKeys.length;
        }
        this.setState({publicKeys, M});
    };

    generateContract = (): string => {
        const {publicKeys, M} = this.state;
        return multisig(publicKeys, M);
    };

    deployContract = (): void => {
        const {deployNetwork} = this.state;
        const {apiBase, chainId} = networks[deployNetwork];
        const resultOrError = compile(this.generateContract());
        const script = 'error' in resultOrError ? '' : resultOrError.result.base64;
        const secrets = [this.state.deploySecret];
        const tx = setScript({script, chainId}, secrets);
        broadcast(tx, apiBase)
            .then(tx => {
                this.handleClose();
                UserDialog.open('Script has been set', <p>Transaction ID:&nbsp;
                    <b>{tx.id}</b></p>, {
                    'Close': () => {
                        return true;
                    }
                });
            })
            .catch(e => {
                UserDialog.open('Error occured', <p>Error:&nbsp;
                    <b>{e.message}</b></p>, {
                    'Close': () => {
                        return true;
                    }
                });
            });
    };

    handleEdit = (contract: string) => () => {
        const {filesStore} = this.props;
        filesStore!.createFile({type: FILE_TYPE.RIDE, content: contract}, true);
        this.handleClose();
    };

    handleNext = () => {
        const {activeStep} = this.state;
        activeStep < 2 ?
            this.setState({activeStep: activeStep + 1})
            :
            this.deployContract();
    };

    handleBack = () => {
        this.setState({activeStep: this.state.activeStep - 1});
    };

    handleClose = () => {
        const {history} = this.props;
        history.push('/');
    };

    notifyUser = (text: string) => this.props.notificationsStore!.notifyUser(text);

    render() {
        const {publicKeys, M, activeStep, deployNetwork, deploySecret, deploySecretType} = this.state;

        let content;
        switch (activeStep) {
            case 0:
                content = <MultisigForm
                    publicKeys={publicKeys}
                    M={M}
                    addPublicKey={this.addPublicKey}
                    removePublicKey={this.removePublicKey}
                    updatePublicKey={this.updatePublicKey}
                    setM={this.setM}/>;
                break;
            case 1:
                const contract = this.generateContract();
                content = <div>
                    <MonacoEditor
                        value={contract}
                        height={300}
                        options={{
                            readOnly: true,
                            scrollBeyondLastLine: false,
                            codeLens: false,
                            minimap: {
                                enabled: false
                            }
                        }}
                    />
                    <div>
                        <Typography>
                            If you do not want to enter seed or private key on next step for some reason, you
                            can copy
                            base64 compiled contract and deploy it by yourself via <a
                            href="https://client.wavesplatform.com" target="_blank">Waves wallet</a>,&nbsp;
                            <a href="https://demo.wavesplatform.com/example/console"
                               target="_blank">console</a>&nbsp;
                            or&nbsp;<a href="https://nodes.wavesplatform.com" target="_blank">REST API</a>
                        </Typography>
                        <Button
                            variant="contained"
                            children="edit"
                            color="primary"
                            onClick={this.handleEdit(contract)}
                        />
                        <Button
                            variant="outlined"
                            children="Copy base64"
                            size="medium"
                            color="primary"
                            onClick={() => {
                                const resultOrError = compile(this.generateContract())
                                const compiled = 'error' in resultOrError ? '' : resultOrError.result.base64;
                                if (copyToClipboard(compiled)) {
                                    this.notifyUser('Copied!');
                                }
                            }}/>
                    </div>
                </div>;
                break;
            case 2:
                content = <div>

                    <Typography>
                        You can fill the form below and press deploy button to make multisignature
                        account immediately
                    </Typography>
                    <TextField
                        label="Network"
                        name="Network"
                        select={true}
                        value={deployNetwork}
                        onChange={(e) => this.setState({deployNetwork: e.target.value as any})}
                        fullWidth={true}
                        style={{marginTop: 12, marginBottom: 12}}
                    >
                        <MenuItem key={'mainnet'} value={'mainnet'}>
                            MAINNET
                        </MenuItem>
                        <MenuItem key={'testnet'} value={'testnet'}>
                            TESTNET
                        </MenuItem>
                    </TextField>
                    <TextField
                        label="Secret type"
                        name="Secret type"
                        select={true}
                        value={deploySecretType}
                        onChange={(e) => this.setState({deploySecretType: e.target.value as any})}
                        fullWidth={true}
                        style={{marginTop: 12, marginBottom: 12}}
                    >
                        <MenuItem key={'Seed phrase'} value={'Seed phrase'} selected={true}>
                            Seed phrase
                        </MenuItem>
                        <MenuItem key={'Private key'} value={'Private key'} disabled={true}>
                            Private key (soon)
                        </MenuItem>))
                    </TextField>
                    <TextField
                        //error={!validatePublicKey(pk)}
                        //helperText={validatePublicKey(pk) ? '' : 'Invalid publicKey'}
                        required={true}
                        label={`${deploySecretType}`}
                        //name={`PK-${i}`}
                        value={deploySecret}
                        onChange={(e) => this.setState({deploySecret: e.target.value})}
                        fullWidth={true}
                        style={{marginTop: 12, marginBottom: 12}}
                    />
                    <Typography>
                        Address:<b>{deploySecret ? libs.crypto.address(deploySecret, networks[deployNetwork].chainId) : ''}</b>
                    </Typography>
                </div>;
                break;
        }

        return (
            <Dialog
                open={true}
                maxWidth={activeStep === 1 ? 'md' : 'sm'}
                //onClose={this.handleClose}
                fullWidth={true}>
                <DialogTitle>
                    <Stepper activeStep={activeStep}>
                        <Step key={0}>
                            <StepLabel>Set public keys</StepLabel>
                        </Step>
                        <Step key={1}>
                            <StepLabel>Review</StepLabel>
                        </Step>
                        <Step key={2}>
                            <StepLabel>Deploy</StepLabel>
                        </Step>
                    </Stepper>
                </DialogTitle>
                <DialogContent children={content}/>
                <DialogActions>
                    <Button
                        variant="text"
                        children="close"
                        color="secondary"
                        onClick={this.handleClose}
                    />
                    <Button
                        variant="text"
                        children="back"
                        color="primary"
                        disabled={activeStep === 0}
                        onClick={this.handleBack}
                    />
                    <Button
                        variant={activeStep === 2 ? 'contained' : 'text'}
                        children={activeStep === 2 ? 'deploy' : 'next'}
                        color="primary"
                        disabled={(!publicKeys.every(validatePublicKey) && activeStep === 0) || (deploySecret === '' && activeStep === 2)}
                        onClick={this.handleNext}
                    />
                </DialogActions>
            </Dialog>
        );
    }
}

interface IMultisigFormProps {
    publicKeys: string[]
    M: number
    addPublicKey: () => void
    removePublicKey: (index: number) => () => void
    updatePublicKey: (index: number) => (e: React.ChangeEvent) => void
    setM: (e: React.ChangeEvent) => void
}

const MultisigForm = ({publicKeys, M, addPublicKey, removePublicKey, updatePublicKey, setM}: IMultisigFormProps) => (
    <div>
        <Grid container spacing={0}>
            <Grid item xs={8}>
                {publicKeys.map((pk, i, array) =>
                    <Grid container spacing={0} key={i}>
                        <Grid item xs={10}>
                            <TextField
                                error={!validatePublicKey(pk)}
                                helperText={validatePublicKey(pk) ? '' : 'Invalid publicKey'}
                                required={true}
                                label={`Public key ${i + 1}`}
                                name={`PK-${i}`}
                                value={pk}
                                onChange={updatePublicKey(i)}
                                fullWidth={true}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            {(i !== 0 || array.length > 1) &&
                            <IconButton onClick={removePublicKey(i)}>
                                <DeleteIcon/>
                            </IconButton>}
                        </Grid>
                    </Grid>
                )}
            </Grid>
            <Grid item xs={4}>
                <TextField
                    label="Required proofs"
                    name="M"
                    select={true}
                    value={M}
                    onChange={setM}
                    fullWidth={true}
                >
                    {Array.from({length: publicKeys.length},
                        (_, i) => <MenuItem key={i} value={i + 1}>
                            {(i + 1).toString()}
                        </MenuItem>)
                    }
                </TextField>
            </Grid>
        </Grid>
        {publicKeys.length < 8 &&
        <div style={{paddingTop: '5%'}}>
            <Button
                variant="contained"
                onClick={addPublicKey}
                color="primary">
                <AddIcon/>
                Add public key
            </Button>
        </div>}
    </div>
);


export const WizardDialog = withRouter(WizardDialogComponent);

