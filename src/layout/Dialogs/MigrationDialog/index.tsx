// import React from 'react';
// import styles from './styles.less';
// import { Bus, WindowAdapter } from '@waves/waves-browser-bus';
// import Button from '@components/Button';
// import { AccountsStore } from '@stores';
// import { inject, observer } from 'mobx-react';
//
// interface IProps {
//     accountsStore?: AccountsStore
// }
//
// @inject('accountsStore')
// @observer
// export default class MigrationDialog extends React.Component {
//
//     private rootRef: React.RefObject<HTMLDivElement> = React.createRef();
//     private bus: Bus | null = null;
//
//     constructor(props: IProps) {
//         super(props);
//         const url = 'http://localhost:8081/migration';
//         const iframe = document.createElement('iframe');
//
//         WindowAdapter.createSimpleWindowAdapter(iframe, {origins: '*'}).then(adapter => {
//             this.bus = new Bus(adapter);
//         });
//
//         iframe.src = url;
//         iframe.className = styles.iframe;
//         // this.rootRef.current && this.rootRef.current.appendChild(iframe);
//         document.body.appendChild(iframe);
//     }
//
//     handleMigrate = () => {
//         this.bus && this.bus.request('get-accounts').then(accounts => {
//             console.log(accounts);
//         });
//     };
//
//     render() {
//         return <div ref={this.rootRef} className={styles.root}>
//             <Button type="action-blue" onClick={this.handleMigrate}>Migrate</Button>
//         </div>;
//     }
//
// }

import React from 'react';
import classNames from 'classnames';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { AccountsStore } from '@stores';
import { RouteComponentProps } from 'react-router';
import NotificationsStore from '@stores/NotificationsStore';
import { Bus, WindowAdapter } from '@waves/waves-browser-bus';

interface IInjectedProps {
    accountsStore?: AccountsStore
    notificationsStore?: NotificationsStore
}

interface IProps extends RouteComponentProps, IInjectedProps {
}

interface IState {
}

@inject('accountsStore', 'notificationsStore')
@observer
export default class MigrationDialog extends React.Component<IProps, IState> {


    handleClose = () => {
        this.props.history.push('/');
    };


    private rootRef: React.RefObject<HTMLDivElement> = React.createRef();
    private bus: Bus | null = null;

    constructor(props: IProps) {
        super(props);
        const url = 'http://localhost:8081/migration';
        const iframe = document.createElement('iframe');

        WindowAdapter.createSimpleWindowAdapter(iframe, {origins: '*'}).then(adapter => {
            this.bus = new Bus(adapter);
        });

        iframe.src = url;
        iframe.className = styles.iframe;
        // this.rootRef.current && this.rootRef.current.appendChild(iframe);
        document.body.appendChild(iframe);
    }

    handleMigrate = () => {
        this.bus && this.bus.request('get-accounts').then(accounts => {
            console.log(accounts);
        });
    };

    render() {
        return <Dialog
            title="Migration"
            onClose={this.handleClose}
            width={618}
            footer={<>
                <Button className={styles.btn} onClick={this.handleClose}>Cancel</Button>
                <Button className={styles.btn} type="action-blue" onClick={this.handleMigrate}>Migrate</Button>
            </>}
            visible
        >
            <div
                // className={styles.root}
            >
            </div>
        </Dialog>;
    }
}

