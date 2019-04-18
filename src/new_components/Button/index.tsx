import React from 'react';
import classNames from 'classnames';
import styles from './styles.less';
import Dropdown  from 'rc-dropdown';
import Menu from 'rc-menu';


interface IButtonProps {
    type?: 'action-blue' | 'action-white' | 'add-block' | 'action-gray'
    className?: string
    children?: any
    onClick?: () => void
    disabled?: boolean
    isDropdown?: boolean
    dropdownData?: JSX.Element[]
}

export default class Button extends React.Component<IButtonProps> {
    render() {
        const {type, className, children, onClick, disabled, isDropdown, dropdownData} = this.props;
        const style = classNames(
            styles.btn,
            className,
            styles[`btn-${type || 'action-white'}`],
            styles[`btn-${isDropdown ? 'dropdown' : ''}`]
        );
        return <div className={styles.root}>
            <button className={style} onClick={onClick} disabled={disabled}>
                {type === 'action-gray' && <div className="copy-18-basic-700"/>}
                {children}
            </button>
            {isDropdown &&
            <Dropdown
                trigger={['click']}
                overlay={<Menu>{dropdownData}</Menu>}
            >
                <button className={styles['drop-block']}>></button>
            </Dropdown>
            }
        </div>;
    }
}
