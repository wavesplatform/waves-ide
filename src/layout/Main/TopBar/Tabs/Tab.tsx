import React from 'react';
import classname from 'classnames';
import styles from './styles.less';
import { TTabInfo } from '@stores/TabsStore';
import Dropdown from '@components/Dropdown';

export interface ITabProps {
    info: TTabInfo
    index: number
    active: boolean
    hidden?: boolean
    onClick?: () => void
    onClose?: () => void
    onCloseAll?: () => void
    onCloseOthers?: () => void
}

const typeIconClassMap: Record<string, { active: string, inactive: string }> = {
    'welcome': {active: styles.systemdocIcn_active, inactive: styles.systemdocIcn},
    'hotkeys': {active: styles.systemdocIcn_active, inactive: styles.systemdocIcn},
    'asset': {active: styles.assetdocIcn_active, inactive: styles.assetdocIcn},
    'account': {active: styles.accountdocIcn_active, inactive: styles.accountdocIcn},
    'library': {active: styles.librarydocIcn_active, inactive: styles.librarydocIcn},
    'dApp': {active: styles.dappdocIcn_active, inactive: styles.dappdocIcn},
    'test': {active: styles.testdocIcn_active, inactive: styles.testdocIcn}
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

    gag = () => {
    };

    render() {
        const active = this.props.active ? 'active' : 'inactive';
        let className;
        if (this.props.hidden) {
            className = styles['dropdown-tab'];
        } else {
            className = styles.tab;
            if (this.props.active) className = classname(className, styles['active-tab']);
        }
        const {info} = this.props;

        const menu = [
            {title: 'Close', clickHandler: this.props.onClose || this.gag},
            {title: 'Close all', clickHandler: this.props.onCloseAll || this.gag},
            {title: 'Close others', clickHandler: this.props.onCloseOthers || this.gag},
        ];

        const tab = <div className={className} onClick={this.handleSelect}>
            <div className={typeIconClassMap[info.type] && typeIconClassMap[info.type][active]}/>
            <div className={styles['tab-text']}>{info.label}</div>
            <div className={styles.closeBtn} onClick={this.handleClose}/>
        </div>;

        return <Dropdown button={tab} trigger={['contextMenu']} items={menu} alignPoint>{tab}</Dropdown>;
    }
}
