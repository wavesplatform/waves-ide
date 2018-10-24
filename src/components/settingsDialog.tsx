import * as React from "react"
import {RouteComponentProps} from 'react-router'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from "@material-ui/core/TextField";
import {connect, Dispatch} from "react-redux"
import {settingsChange} from "../store/settings/actions";
import {ISettingsState} from "../store/settings";
import {RootAction, RootState} from "../store";


export class SettingsDialogComponent extends React.Component<RouteComponentProps & ISettingsState &
    {handleChange: (state: Partial<ISettingsState>) => any}> {

    handleClose = () => this.props.history.push('/');

    render() {
        const {apiBase, chainId, handleChange} =  this.props;
        const actions =  <Button
            children="ok"
            color="primary"
            onClick={this.handleClose}
        />

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
                                value={apiBase}
                                //floatingLabelFixed={true}
                                fullWidth={true}
                                onChange={(e) => {
                                   handleChange({apiBase: (e.nativeEvent.target as any).value})
                                }}
                            /><br/>
                            <TextField
                                label="Network Byte"
                                value={chainId}
                                //floatingLabelFixed={true}
                                onChange={(e) => {
                                    handleChange({chainId: (e.nativeEvent.target as any).value})
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
        )
    }
}

const mapStateToProps = (state:RootState) => state.settings
const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    handleChange: (partialSettings:Partial<ISettingsState>) => dispatch(settingsChange(partialSettings))
})
export const SettingsDialog = connect(mapStateToProps,mapDispatchToProps)(SettingsDialogComponent)

