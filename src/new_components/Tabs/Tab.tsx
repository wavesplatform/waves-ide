import React from 'react';
import classname from 'classnames';
import styles from './styles.less';
import { TTabInfo } from '@stores/TabsStore';

export interface ITabProps {
    info: TTabInfo
    active: boolean
    hidden?: boolean
    onClick?: () => void
    onClose?: () => void
}

const typeIconClassMap: Record<string, {active: string, inactive: string}> = {
    'welcome': { active: 'systemdoc-16-submit-400', inactive: 'systemdoc-16-basic-600' },
    'asset': { active: 'assetdoc-diamond-16-submit-400', inactive: 'assetdoc-diamond-16-basic-600' },
    'account': { active: 'accountdoc-16-submit-400', inactive: 'accountdoc-16-basic-600' },
    'dApp': { active: 'Dapps-16-Submit400', inactive: 'dapps-16-basic-600' },
    'test': { active: 'Test-16-Submit400', inactive: 'test-16-basic-600' }
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
            <div className={'close-12-basic-600'} onClick={this.handleClose}/>
        </div>;
    }
}
