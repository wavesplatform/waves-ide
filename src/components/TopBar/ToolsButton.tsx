import * as React from "react"
import {RouteComponentProps, withRouter} from 'react-router'
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {connect, Dispatch} from 'react-redux'
import {RootAction} from "../../store/index";
import {StyledComponentProps, Theme} from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
    root: {
        minWidth: 90,
        color: 'white',
        marginLeft: 15
    }
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({});

interface ToolsButtonProps extends RouteComponentProps,
    ReturnType<typeof mapDispatchToProps>,
    StyledComponentProps<keyof ReturnType<typeof styles>> {

}

class ToolsButtonComponent extends React.Component<ToolsButtonProps, { anchorEl: any }> {

    state = {
        anchorEl: null
    };

    handleClick = (event: React.MouseEvent<{}>) => {
        this.setState({anchorEl: event.currentTarget})
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };


    handleWizard = (kind: string) => () => {
        const {history} = this.props;
        this.handleClose();
        history.push(`wizard/${kind}`)
    };

    handleTxGenerator = () => {
        const {history} = this.props;
        this.handleClose();
        history.push(`txGenerator`)
    };

    handleTxSigner = () => {
        const {history} = this.props;
        this.handleClose();
        history.push(`signer`)
    };

    render() {
        const {classes} = this.props;
        const {anchorEl} = this.state;

        return (
            <React.Fragment>
                <Button
                    className={classes!.root}
                    //inline backgroundColor disables hover
                    style={{backgroundColor: '#1f5af6'}}
                    variant="text"
                    aria-owns={anchorEl ? 'new-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    <Icon className="material-icons">build</Icon>
                    Tools
                </Button>
                <Menu id="new-menu"
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      onClose={this.handleClose}
                      getContentAnchorEl={null}
                      anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left"
                      }}
                      transformOrigin={{
                          vertical: "top",
                          horizontal: "left"
                      }}
                >
                    <MenuItem onClick={this.handleWizard('multisig')}>
                        <Icon className="material-icons" style={{color: "#757575", marginRight: 24}}>code</Icon>
                        Multisignature account wizard
                    </MenuItem>
                    <MenuItem onClick={this.handleTxGenerator}>
                        <Icon className="material-icons" style={{color: "#757575", marginRight: 24}}>code</Icon>
                        Transfer Tx generator
                    </MenuItem>
                    <MenuItem onClick={this.handleTxSigner}>
                        <Icon className="material-icons" style={{color: "#757575", marginRight: 24}}>code</Icon>
                        Transaction signer
                    </MenuItem>
                </Menu>
            </React.Fragment>
        )
    }
}


export const ToolsButton = withStyles(styles)(withRouter(ToolsButtonComponent));


