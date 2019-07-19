import * as React from 'react';
import Info from './Info';
import { inject, observer } from 'mobx-react';
import { SettingsStore } from '@stores';
import styles from './styles.less';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

@inject('settingsStore')
@observer
export default class Timeouts extends React.Component<IInjectedProps> {

    handleChange = (field: 'node' | 'test') => (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = +e.target.value;
        if (isNaN(val)) val = 0;
        const store = this.props.settingsStore!;
        store.updateTimeout(val, field);
    };

    render() {
        const {nodeTimeout, testTimeout} = this.props.settingsStore!;

        return <>
            <div className={styles.section_head}>Timeout</div>
            <div className={styles.timeouts}>
                <div className={styles.timeout_item}>
                    <div className={styles.section_item_title}>Node request</div>
                    <div className={styles.timeout_input_info}>
                        <input
                            className={styles.inputTimeout}
                            value={nodeTimeout}
                            onChange={this.handleChange('node')}
                        />
                        <Info infoType={'NodeTimeout'}/>
                    </div>
                </div>
                <div className={styles.timeout_item}>
                    <div className={styles.section_item_title}>Tests</div>
                    <div className={styles.timeout_input_info}>
                        <input
                            className={styles.inputTimeout}
                            value={testTimeout}
                            onChange={this.handleChange('test')}
                        />
                        <Info infoType={'TestTimeout'}/>
                    </div>
                </div>
            </div>
        </>;
    }
}
