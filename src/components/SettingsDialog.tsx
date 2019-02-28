import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { SettingsStore } from '@src/mobx-store';
import { observer, inject } from 'mobx-react';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface ISettingsDialogProps extends RouteComponentProps, IInjectedProps{

}

@inject('settingsStore')
@observer
export class SettingsDialog extends React.Component<ISettingsDialogProps> {

    handleClose = () => this.props.history.push('/');

    render() {
        const {settingsStore} =  this.props;
        // Todo: store supports multiple nodes. We work only with default for now
        const node = settingsStore!.defaultNode!;

        const actions =  <Button
            children="ok"
            color="primary"
            onClick={this.handleClose}
        />;

        return (
            <Dialog
                open={true}
                fullWidth={true}
                //onClose={this.handleClose}
            >
                <DialogTitle children="Settings"/>
                <DialogContent>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div style={{flex: 2}}>
                            <TextField
                                label="Node URL"
                                value={node.url}
                                //floatingLabelFixed={true}
                                fullWidth={true}
                                onChange={(e) => {
                                    node.url = e.target.value;
                                }}
                            /><br/>
                            <TextField
                                label="Network Byte"
                                value={node.chainId}
                                //floatingLabelFixed={true}
                                onChange={(e) => {
                                  node.chainId = e.target.value;
                                }}
                            />
                        </div>
                        <i style={{paddingTop: '27px'}} className="material-icons">info</i>
                        <div style={{padding: '15px', flex: 1}}>
                            Here you can set environment variables.
                            <ul>
                                <li><b>Node URL: </b>Node address</li>
                                <li><b>Network byte: </b>'T' for testnet 'W' for mainnet</li>
                            </ul>
                            Console functions use them as default
                        </div>
                    </div>
                </DialogContent>
                <DialogActions children={actions}/>
            </Dialog>
        );
    }
}

