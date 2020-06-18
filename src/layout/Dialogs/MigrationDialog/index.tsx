import React from 'react';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { MigrationStore, AccountsStore, SettingsStore } from '@stores';
import { NetworkChainId } from '@stores/AccountsStore';
import { newUrl, stagenetNewUrl } from '@stores/MigrationStore';
import { Loading } from '@src/layout/Dialogs/MigrationDialog/Loading';
import Link from '@components/Link';

interface IProps {
    migrationStore?: MigrationStore
    accountsStore?: AccountsStore
    settingsStore?: SettingsStore
}

@inject('migrationStore', 'accountsStore', 'settingsStore')
@observer
export default class MigrationDialog extends React.Component<IProps> {

    handleExportState = () => this.props.settingsStore!.exportState();
    
    handleOpenIde = (isStagenetMigration: boolean = false) => 
        this.props.migrationStore!.openIde(isStagenetMigration)

    handleMigrate = (isStagenetMigration: boolean = false) => 
        this.props.migrationStore!.dispatchMigration(isStagenetMigration)

    render() {
        const {
            stagenetMigrationState,
            migrationState,
            dispatchMigration,
            openIde
        } = this.props.migrationStore!;

        const {accountGroups} = this.props!.accountsStore!;

        const hasStagenetAccounts = accountGroups[NetworkChainId.S].accounts.length > 0

        return <Dialog
            className={styles.dialog}
            title="Move IDE"
            width={618}
            footer={(
                <div className={styles.footer}>
                    <div className={styles.footer_left}>
                        <Button type="action-gray" onClick={this.handleExportState}>
                            Download projects
                        </Button>
                    </div>

                    <div className={styles.footer_right}>
                        {hasStagenetAccounts && (
                            <Button
                                type="action-blue"
                                onClick={(e) => stagenetMigrationState.success ? this.handleOpenIde(true) : this.handleMigrate(true)}
                                disabled={!(stagenetMigrationState.success || !stagenetMigrationState.loading)}
                            >
                                {stagenetMigrationState.success ? 'Open new Stagenet IDE' : stagenetMigrationState.loading ? <Loading/> : 'Migrate stagenet'}
                            </Button>
                        )}

                        <Button
                            type="action-blue"
                            onClick={(e) => migrationState.success ? this.handleOpenIde() : this.handleMigrate()}
                            disabled={!(migrationState.success || !migrationState.loading)}
                        >
                            {migrationState.success ? 'Open new IDE' : migrationState.loading ? <Loading/> : 'Migrate'}
                        </Button>
                    </div>
                </div>
            )}
            visible
        >
            <div className={styles.root}>

                <div className={styles.row}>
                    Dear users, please note that WAVES IDE has moved to&nbsp;
                    <Link className={styles.link} href={newUrl}>
                        {(newUrl as string).replace(/^https?:\/\//, '')}
                    </Link>
                    .
                </div>

                <div className={styles.row}>
                    To automatically transfer your projects and accounts to the new service, click the "Migrate" button.
                </div>

                {hasStagenetAccounts && (
                    <div className={styles.row}>
                        To work Stagenet network you need to use&nbsp;
                        <Link className={styles.link} href={stagenetNewUrl}>
                            {(stagenetNewUrl as string).replace(/^https?:\/\//, '')}
                        </Link>
                        . To automatically transfer your data to Stagenet network, click the "Migrate stagenet" button.
                    </div>
                )}

                <div className={styles.row}>
                    You can also transfer your data manually using the "Download Projects" button.
                </div>

            </div>
        </Dialog>;
    }
}


