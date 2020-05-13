import React from 'react';
import styles from './styles.less';
import { Bus, WindowAdapter } from '@waves/waves-browser-bus';
import Button from '@components/Button';
import { AccountsStore } from '@stores';
import { inject, observer } from 'mobx-react';

interface IProps {
    accountsStore?: AccountsStore
}

@inject('accountsStore')
@observer
export default class MigrationDialog extends React.Component {

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
        return <div ref={this.rootRef} className={styles.root}>
            <Button type="action-blue" onClick={this.handleMigrate}>Migrate</Button>
        </div>;
    }

}
