import React from 'react';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { MigrationStore } from '@stores';
import { Loading } from '@src/layout/Dialogs/MigrationDialog/Loading';
import { newUrl } from '@stores/MigrationStore';
import Link from '@components/Link';

interface IProps {
    migrationStore?: MigrationStore
}

@inject('migrationStore')
@observer
export default class MigrationDialog extends React.Component<IProps> {

    render() {
        const {loading, success, dispatchMigration, openIde} = this.props.migrationStore!;
        return <Dialog
            className={styles.dialog}
            title="Move IDE"
            width={618}
            footer={
                <Button type="action-blue"
                        onClick={success ? openIde : dispatchMigration} disabled={!(success || !loading)}>
                    {success ? 'Open new IDE' : loading ? <Loading/> : 'Migrate'}
                </Button>
            }
            visible
        >
            <div className={styles.root}>

                <div className={styles.row}>
                    Dear users WAVES IDE has moved to&nbsp;<Link className={styles.link} href={newUrl}>
                    {(newUrl as string).replace(/^https?:\/\//, '')}
                </Link>
                </div>

                <div className={styles.row}>
                    To transfer your projects and accounts to new service, please click the button "Migrate"
                </div>

            </div>
        </Dialog>;
    }
}


