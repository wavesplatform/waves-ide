import React, {Component} from 'react'
import {connect} from 'react-redux'
import {generateMnemonic} from 'bip39'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import {RootState} from "../../store";
import {IAccountsState} from "../../store/accounts";
import * as accountsActions from "../../store/accounts/actions"
import IconButton from "@material-ui/core/IconButton/IconButton";
import Button from "@material-ui/core/Button/Button";
import Icon from "@material-ui/core/Icon/Icon";
import TextField from "@material-ui/core/TextField/TextField";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import Grid from "@material-ui/core/Grid/Grid";
import Typography from "@material-ui/core/Typography/Typography";
import {Theme, withStyles, StyledComponentProps} from '@material-ui/core/styles';
import AccountSummary from './AccountSummary'
import {Repl} from 'waves-repl'

const styles = (theme:Theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
});

type AccountsTabProps = IAccountsState & typeof accountsActions & {classes:any}

class AccountsTabComponent extends Component<AccountsTabProps, { expanded: number | null }> {
    state = {
        expanded: null
    }

    handlePanelChange = (index: number) => (event: React.ChangeEvent<{}>, expanded: boolean) => {
        this.setState({
            expanded: expanded ? index : null,
        });
    };

    handleRename = (index: number) => (label: string) => this.props.setAccountLabel({label,index});

    handleAdd = () => this.props.addAccount(generateMnemonic());

    handleRemove = (i: number) => () => this.props.removeAccount(i);

    render() {
        const {
            classes,
            accounts,
            selectedAccount,
            setAccountSeed,
            setAccountLabel,
            selectAccount,
            addAccount,
            removeAccount
        } = this.props;

        const {expanded} = this.state;

        return (
            <div className={classes.root}>
                <div>
                    {accounts.map((account, i) => (
                        <ExpansionPanel key={i} expanded={expanded === i} onChange={this.handlePanelChange(i)}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <AccountSummary
                                    label={account.label}
                                    onEdit={this.handleRename(i)}
                                    onDelete={(i !== 0 || accounts.length > 1) ? this.handleRemove(i) : undefined}
                                />
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <div style={{flexDirection: "column"}}>
                                    <div>Address</div>
                                    <div>{Repl.API.address(account.seed)}</div>
                                    <div>Seed</div>
                                    <div>{account.seed}</div>
                                </div>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>))}
                </div>
                <div style={{paddingTop: '5%'}}>
                    <Button
                        variant="contained"
                        onClick={this.handleAdd}
                        color="primary">
                        <Icon>add</Icon>
                        Add account
                    </Button>
                </div>
            </div>
        )
    }
}



const mapStateToProps = (state: RootState) => state.accounts

export const AccountsTab = withStyles(styles)(connect(mapStateToProps, accountsActions)(AccountsTabComponent))
