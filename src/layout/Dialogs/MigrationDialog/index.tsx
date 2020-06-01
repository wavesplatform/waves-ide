import React from 'react';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { MigrationStore } from '@stores';
import { Loading } from '@src/layout/Dialogs/MigrationDialog/Loading';

interface IProps {
    migrationStore?: MigrationStore
}

@inject('migrationStore')
@observer
export default class MigrationDialog extends React.Component<IProps> {

    render() {
        const {ready, success, dispatchMigration, handleOpenIde} = this.props.migrationStore!;
        return <Dialog
            className={styles.dialog}
            title="Move IDE"
            width={618}
            footer={<>{success
                ? <Button className={styles.btn} type="action-blue" onClick={handleOpenIde} disabled={!success}>
                    Open new IDE
                </Button>
                : <Button className={styles.btn} type="action-blue" onClick={dispatchMigration} disabled={!ready}>
                    {ready ? 'Migrate' : <Loading/>}
                </Button>}
            </>
            }
            visible
        >
            <div className={styles.root}>

                <div className={styles.row}>
                    Dear users WAVES IDE has moved to&nbsp;<a className={styles.link}>WAVES-IDE-2.com</a>
                </div>

                <div className={styles.row}>
                    To transfer your projects and accounts to new service, please click the button "Migrate"
                </div>

            </div>
        </Dialog>;
    }
}


