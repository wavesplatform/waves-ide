import React from 'react';
import classname from 'classnames';
import styles from './styles.less';
import { TTabInfo } from '@stores/TabsStore';

export interface ITabProps {
    info: TTabInfo
    index: number
    active: boolean
    hidden?: boolean
    onClick?: () => void
    onClose?: () => void
}

const typeIconClassMap: Record<string, {active: string, inactive: string}> = {
    'welcome': { active: styles.systemdocIcn_active, inactive: styles.systemdocIcn },
    'hotkeys':  { active: styles.systemdocIcn_active, inactive: styles.systemdocIcn },
    'asset': { active: styles.assetdocIcn_active, inactive: styles.assetdocIcn },
    'account': { active: styles.accountdocIcn_active, inactive: styles.accountdocIcn},
    'dApp': { active: styles.dappdocIcn_active, inactive: styles.dappdocIcn},
    'test': { active: styles.testdocIcn_active, inactive: styles.testdocIcn }
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
        const active = this.props.active ? 'active' : 'inactive';
        let className;
        if (this.props.hidden){
            className = styles['dropdown-tab'];
        }else {
            className = styles.tab;
            if (this.props.active) className = classname(className, styles['active-tab']);
        }
        const {info} = this.props;
        return <div className={className} onClick={this.handleSelect}>
            <div className={typeIconClassMap[info.type] && typeIconClassMap[info.type][active]}/>
            <div className={styles['tab-text']}>{info.label}</div>
            <div className={styles.closeBtn} onClick={this.handleClose}/>
        </div>;
    }
}
