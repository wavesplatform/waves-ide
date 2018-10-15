import * as React from "react"
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
// import {Dialog, FlatButton} from "material-ui"
import {connect} from "react-redux"
import {IAppState} from 'state'

export class userDialog extends React.Component<{}> {
    static ref: userDialog
    private isOpen;
    private options: { label: string, text: React.ReactNode, buttons: Record<string, () => boolean> }

    constructor(props) {
        super(props)
        this.isOpen = false
        this.options = {label: '', text: '', buttons: {}}
        userDialog.ref = this
    }

    handleClose() {
        this.isOpen = false
        this.forceUpdate()
    }

    static open(label: string, text: React.ReactNode, buttons: Record<string, () => boolean>) {
        userDialog.ref.options = {label, text, buttons}
        userDialog.ref.isOpen = true
        userDialog.ref.forceUpdate()
    }

    render() {

        const dialogActions = Object.keys(this.options.buttons).map(((b, i) => <Button
            variant="text"
            key={i}
            children={b}
            color={i !== 0 ? "primary" : "secondary"}
            onClick={() => {
                const close = this.options.buttons[b]()
                if (close)
                    this.handleClose()
            }}
        />))

        return (
            <Dialog
                title={this.options.label}
                fullWidth={true}
                open={this.isOpen}
                onClose={this.handleClose}>
                <DialogTitle children={this.options.label}/>
                <DialogContent children={this.options.text}/>
                <DialogActions children={dialogActions}/>
            </Dialog>
        )
    }
}

export const UserDialog = connect((state: IAppState) => ({}))(userDialog)

