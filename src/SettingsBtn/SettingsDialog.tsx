import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import 'rc-dialog/assets/index.css';
import Dialog from 'rc-dialog';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { SettingsStore } from '@stores';
import { observer, inject } from 'mobx-react';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface ISettingsDialogProps extends RouteComponentProps, IInjectedProps {

}

@inject('settingsStore')
@observer
export class SettingsDialog extends React.Component<ISettingsDialogProps> {

    handleClose = () => this.props.history.push('/');

    render() {
        const {settingsStore} = this.props;
        // Todo: store supports multiple nodes. We work only with default for now
        const node = settingsStore!.defaultNode!;

        const actions = <Button
            children="ok"
            color="primary"
            onClick={this.handleClose}
        />;

        return (
            <Dialog
                title="Settings"
                footer={actions}
                visible
                onClose={this.handleClose}
            >
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div style={{flex: 2}}>
                        <TextField
                            label="Node URL"
                            value={node.url}
                            fullWidth={true}
                            onChange={(e) => {
                                node.url = e.target.value;
                            }}
                        /><br/>
                        <TextField
                            label="Network Byte"
                            value={node.chainId}
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
            </Dialog>
        );
    }
}

