import React from 'react';
import classNames from 'classnames';
import styles from './styles.less';
import Dropdown  from 'rc-tooltip';

interface IButtonProps {
    type?: 'action-blue' | 'action-white' | 'add-block' | 'action-gray' | 'action-red'
    title?: string
    className?: string
    children?: any
    onClick?: (e: React.MouseEvent) => void
    disabled?: boolean
    isDropdown?: boolean
    dropdownData?: JSX.Element
}

export default class Button extends React.Component<IButtonProps> {
    render() {
        const {type, className, children, onClick, disabled, isDropdown, dropdownData, title} = this.props;
        const style = classNames(
            styles.btn,
            className,
            styles[`btn-${type || 'action-white'}`],
            styles[`btn-${isDropdown ? 'dropdown' : ''}`]
        );
        return <div className={styles.root}>
            <button className={style} onClick={onClick} disabled={disabled} title={title}>
                {type === 'action-gray' && <div className="copy-18-basic-700"/>}
                {children}
            </button>
            {isDropdown &&
            <Dropdown
                placement="topLeft"
                trigger={['click']}
                overlay={dropdownData}
            >
                <button disabled={disabled} className={styles['drop-block']}>></button>
            </Dropdown>
            }
        </div>;
    }
}
