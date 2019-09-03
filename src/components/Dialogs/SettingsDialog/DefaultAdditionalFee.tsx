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
export default class DefaultAdditionalFee extends React.Component<IInjectedProps> {

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = +e.target.value;
        if (isNaN(val)) val = 0;
        const store = this.props.settingsStore!;
        store.defaultAdditionalFee = val;
    };

    render() {
        return <>
            <div className={styles.section_head}>Default additional fee</div>
            <div className={styles.timeouts}>
                <div className={styles.timeout_item}>
                    <div className={styles.section_item_title}>fee</div>
                    <div className={styles.timeout_input_info}>
                        <input
                            className={styles.inputTimeout}
                            value={this.props.settingsStore!.defaultAdditionalFee}
                            onChange={this.handleChange}
                        />
                        <Info infoType="DefaultAdditionalFee"/>
                    </div>
                </div>
            </div>
        </>;
    }
}
