import React from 'react';
import { generateMnemonic } from 'bip39';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button/Button';
import { Theme, withStyles, StyledComponentProps } from '@material-ui/core/styles';
import AccountSummary from './AccountSummary';
import AccountDetails from './AccountDetails';
import AddIcon from '@material-ui/icons/Add';
import { AccountsStore, NotificationsStore } from '@stores';
import { inject, observer } from 'mobx-react';

const styles = (theme: Theme) => ({
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

interface IInjectedProps {
    accountsStore?: AccountsStore
    notificationsStore?: NotificationsStore
}

interface IAccountsTabProps extends StyledComponentProps<keyof ReturnType<typeof styles>>, IInjectedProps {
}

@inject('accountsStore', 'settingsStore', 'notificationsStore')
@observer
class AccountsTabComponent extends React.Component<IAccountsTabProps, { expanded: number | null }> {
    state = {
        expanded: null
    };

    handlePanelChange = (index: number) => (event: React.ChangeEvent<{}>, expanded: boolean) => {
        this.setState({
            expanded: expanded ? index : null,
        });
    };

    handleRename = (index: number) => (label: string) => this.props.accountsStore!.setAccountLabel(index, label);

    handleSeedChange = (index: number) => (seed: string) => this.props.accountsStore!.setAccountSeed(index, seed);

    handleAdd = () => this.props.accountsStore!.createAccount(generateMnemonic());

    handleRemove = (i: number) => () => this.props.accountsStore!.deleteAccount(i);

    handleSelect = (i: number) => () => this.props.accountsStore!.setDefaultAccount(i);

    render() {
        const {classes, accountsStore, notificationsStore} = this.props;

        const {expanded} = this.state;

        return (
            <div className={classes!.root}>
                <div>
                    {accountsStore!.accounts.map((account, i) => (
                        <ExpansionPanel key={i} expanded={expanded === i} onChange={this.handlePanelChange(i)}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <AccountSummary
                                    selected={i === accountsStore!.activeAccountIndex}
                                    label={account.label}
                                    onEdit={this.handleRename(i)}
                                    onSelect={this.handleSelect(i)}
                                    onDelete={(i !== 0 || accountsStore!.accounts.length > 1) ?
                                        this.handleRemove(i) :
                                        undefined}
                                />
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <AccountDetails
                                    chainId={accountsStore!.rootStore.settingsStore.defaultNode!.chainId}
                                    seed={accountsStore!.accounts[i].seed}
                                    onSeedChange={this.handleSeedChange(i)}
                                    notifyUser={(msg: string) => notificationsStore!.notifyUser(msg)}
                                />
                            </ExpansionPanelDetails>
                        </ExpansionPanel>))}
                </div>
                <div style={{paddingTop: '5%', display: 'flex', justifyContent: 'center'}}>
                    <Button
                        variant="contained"
                        onClick={this.handleAdd}
                        color="primary">
                        <AddIcon/>
                        Add account
                    </Button>
                </div>
            </div>
        );
    }
}

export const AccountsTab = withStyles(styles)(AccountsTabComponent);
