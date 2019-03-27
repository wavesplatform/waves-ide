import React from 'react';
import classname from 'classnames';
import styles from './styles.less';
import { TTabInfo } from '@stores/TabsStore';

export interface ITabProps {
    info: TTabInfo
    active: boolean
    onClick?: () => void
    onClose?: () => void
}

const typeIconClassMap: Record<string, {active: string, inactive: string}> = {
    'welcome': { active: 'accountdoc-16-submit-400', inactive: 'systemdoc-16-basic-600' },
    'assetScript': { active: 'accountdoc-16-submit-400', inactive: 'assetdoc-16-basic-600' },
    'accountScript': { active: 'accountdoc-16-submit-400', inactive: 'accountdoc-16-basic-600' },
    'test': { active: 'accountdoc-16-submit-400', inactive: 'accountdoc-16-basic-600' }
};

export default class Tab extends React.Component<ITabProps> {
    render() {
        let className = styles.tab;
        const active = this.props.active ? 'active' : 'inactive';
        if (this.props.active) className = classname(className, styles['active-tab']);

        const {onClick, onClose, info} = this.props;
        return <div className={className}>
            <div className={typeIconClassMap[info.type] && typeIconClassMap[info.type][active]}/>
            <span className={styles['tab-text']} onClick={onClick}>{info.label}</span>
            <button style={{width: 22}} onClick={onClose}>x</button>
        </div>;
    }
}
