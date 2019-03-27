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
    handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.props.onClick && this.props.onClick();
    };

    handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.props.onClose && this.props.onClose();
    };

    render() {
        let className = styles.tab;
        const active = this.props.active ? 'active' : 'inactive';
        if (this.props.active) className = classname(className, styles['active-tab']);

        const {info} = this.props;
        return <div className={className} onClick={this.handleSelect}>
            <div className={typeIconClassMap[info.type] && typeIconClassMap[info.type][active]}/>
            <div className={styles['tab-text']}>{info.label}</div>
            <div className={'close-12-basic-600'} onClick={this.handleClose}/>
        </div>;
    }
}
