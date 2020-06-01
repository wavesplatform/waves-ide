import React from 'react';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { AccountsStore, SettingsStore } from '@stores';
import NotificationsStore from '@stores/NotificationsStore';
import { Bus, WindowAdapter } from '@waves/waves-browser-bus';
import { Loading } from '@src/layout/Dialogs/MigrationDialog/Loading';

interface IProps {
    accountsStore?: AccountsStore
    notificationsStore?: NotificationsStore
    settingsStore?: SettingsStore
}

interface IState {
    ready: boolean
    success: boolean
}

const url = 'http://localhost:8080';
// const url = 'https://waves-ide.com';


@inject('accountsStore', 'settingsStore', 'notificationsStore')
@observer
export default class MigrationDialog extends React.Component<IProps, IState> {

    private bus: Bus | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {ready: false, success: false};
        const isSafari = false;
        // const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
        const init = (adapter: any) => {
            const bus = new Bus(adapter);
            // bus.once('ready', () => {
            //     this.setState({ready: true});
            // });
            bus.on('migration-success', () => {
                this.setState({success: true});
            });
        };

        if (isSafari) {
            const win = window.open(url);
            WindowAdapter.createSimpleWindowAdapter(win as any, {origins: '*'}).then(init);
        } else {

            const iframe = document.createElement('iframe');
            WindowAdapter.createSimpleWindowAdapter(iframe, {origins: '*'}).then(init);

            iframe.src = url;
            iframe.className = styles.iframe;
            document.body.appendChild(iframe);
            this.initIframeStatusWatcher();
        }
    }

    initIframeStatusWatcher(): void {
        let counter = 0;
        const interval = setInterval(async () => {
            counter++;
            this.bus && this.bus.request('ready').then(() => {
                this.setState({ready: true});
                clearInterval(interval);
            });
        }, 1000);

        if (counter >= 10) {
            clearInterval(interval);
        }

    }

    handleMigrate = () => {
        this.setState({ready: false});
        this.bus && this.bus.dispatchEvent('migrate', this.props.settingsStore!.JSONState);
    };

    handleOpenIde = () => window.open(url);

    render() {
        const {ready, success} = this.state;
        return <Dialog
            className={styles.dialog}
            title="Move IDE"
            width={618}
            footer={<>{success
                ? <Button className={styles.btn} type="action-blue" onClick={this.handleOpenIde} disabled={!success}>
                    Open new IDE
                </Button>
                : <Button className={styles.btn} type="action-blue" onClick={this.handleMigrate} disabled={!ready}>
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


