import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

export class UserDialog extends React.Component<{}> {
    static ref: UserDialog;
    private isOpen = false;
    private options: { label: string, text: React.ReactNode, buttons: Record<string, () => boolean> };

    constructor(props: {}) {
        super(props);
        this.options = {label: '', text: '', buttons: {}};
        UserDialog.ref = this;
    }

    handleClose() {
        this.isOpen = false;
        this.forceUpdate();
    }

    static open(label: string, text: React.ReactNode, buttons: Record<string, () => boolean>) {
        UserDialog.ref.options = {label, text, buttons};
        UserDialog.ref.isOpen = true;
        UserDialog.ref.forceUpdate();
    }

    render() {

        const dialogActions = Object.keys(this.options.buttons).map(((b, i) => <Button
            variant="text"
            key={i}
            children={b}
            color={i !== 0 ? 'primary' : 'secondary'}
            onClick={() => {
                const close = this.options.buttons[b]();
                if (close) {
                    this.handleClose();
                }
            }}
        />));

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
        );
    }
}

