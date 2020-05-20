import React from 'react';
import Dialog from '@src/components/Dialog';
import Button from '@src/components/Button';
import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { AccountsStore, SettingsStore } from '@stores';
import NotificationsStore from '@stores/NotificationsStore';
import { Bus, WindowAdapter } from '@waves/waves-browser-bus';

interface IProps {
    accountsStore?: AccountsStore
    notificationsStore?: NotificationsStore
    settingsStore?: SettingsStore
}

interface IState {
    ready: boolean
}

@inject('accountsStore', 'settingsStore', 'notificationsStore')
@observer
export default class MigrationDialog extends React.Component<IProps, IState> {

    private bus: Bus | null = null;

    constructor(props: IProps) {
        super(props);

        this.state = {ready: false};

        const url = 'https://waves-ide.com';
        const iframe = document.createElement('iframe');

        WindowAdapter.createSimpleWindowAdapter(iframe, {origins: '*'}).then(adapter => {
            this.bus = new Bus(adapter);
            this.bus.on('migration-success', () => {
            window.open(url)
            });
        });


        iframe.src = url;
        iframe.className = styles.iframe;
        document.body.appendChild(iframe);

        this.initIframeStatusWatcher();
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
        this.state = {ready: false};
        this.bus && this.bus.dispatchEvent('migrate', this.props.settingsStore!.JSONState);
    };

    render() {
        return <Dialog
            className={styles.dialog}
            title="Move IDE"
            width={618}
            footer={
                <Button
                    className={styles.btn}
                    type="action-blue"
                    onClick={this.handleMigrate}
                    disabled={!this.state.ready}
                >
                    Migrate
                </Button>
            }
            visible
        >
            <div className={styles.root}>

                <div className={styles.row}>
                    Dear users WAVES IDE has moved to <a className={styles.link}>WAVES-IDE-2.com</a>
                </div>

                <div className={styles.row}>
                    To transfer your projects and accounts to new service, please click the button "Migrate"
                </div>

            </div>
        </Dialog>;
    }
}

