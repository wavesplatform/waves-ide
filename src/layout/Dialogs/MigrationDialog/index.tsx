import React from 'react';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { MigrationStore, AccountsStore, SettingsStore } from '@stores';
import { NetworkChainId, IAccount } from '@stores/AccountsStore';
import { newUrl, stagenetNewUrl } from '@stores/MigrationStore';
import { FilesStore  } from '@stores/FilesStore';
import { Loading } from '@src/layout/Dialogs/MigrationDialog/Loading';
import Link from '@components/Link';

interface IProps {
    migrationStore?: MigrationStore
    accountsStore?: AccountsStore
    settingsStore?: SettingsStore
    filesStore?: FilesStore
}

@inject('migrationStore', 'accountsStore', 'settingsStore', 'filesStore')
@observer
export default class MigrationDialog extends React.Component<IProps> {

    handleExportState = () => this.props.settingsStore!.exportState();
    
    handleOpenIde = (isStagenetMigration: boolean = false) => 
        this.props.migrationStore!.openIde(isStagenetMigration)

    handleMigrate = (isStagenetMigration: boolean = false) => 
        this.props.migrationStore!.dispatchMigration(isStagenetMigration)

    render() {
        const { files } = this.props.filesStore!;
        const { customNodes } = this.props.settingsStore!;

        const {
            stagenetMigrationState
        } = this.props.migrationStore!;

        const {accountGroups, nodesAccounts} = this.props!.accountsStore!;

        const isMigrationAvailable = 
            nodesAccounts.length > 0 ||
            files.length > 0 ||
            customNodes.length > 0;

        return <Dialog
            className={styles.dialog}
            title="Move IDE"
            width={618}
            footer={
                isMigrationAvailable
                    ? (
                        <div className={styles.footer}>
                            <div className={styles.footer_left}>
                                <Button type="action-gray" onClick={this.handleExportState}>
                                    Export
                                </Button>
                            </div>

                            <div className={styles.footer_right}>
                                <Button
                                    type="action-blue"
                                    onClick={(e) => stagenetMigrationState.success ? this.handleOpenIde(true) : this.handleMigrate(true)}
                                    disabled={!(stagenetMigrationState.success || !stagenetMigrationState.loading)}
                                >
                                    {stagenetMigrationState.success ? 'Open new Stagenet IDE' : stagenetMigrationState.loading ? <Loading/> : 'Migrate'}
                                </Button>
                            </div>
                        </div>
                    )
                    : undefined
            }
            visible
        >
            <div className={styles.root}>

                <div className={styles.row}>
                    Dear users, please note that WAVES IDE has moved to&nbsp;
                    <Link className={styles.link} href={stagenetNewUrl}>
                        {(stagenetNewUrl as string).replace(/^https?:\/\//, '')}
                    </Link>
                    .
                </div>

                {isMigrationAvailable && (
                    <>
                        <div className={styles.row}>
                            To automatically transfer your projects and accounts to the new service, click the "Migrate" button.
                        </div>


                        <div className={styles.row}>
                            You can also transfer your data manually using the "Export" button.
                        </div>
                    </>
                )}
            </div>
        </Dialog>;
    }
}


