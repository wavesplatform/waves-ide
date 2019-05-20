import React from 'react';
import DropDown from 'rc-dropdown';
import Menu, { MenuItem } from 'rc-menu';
import styles from './styles.less';
import classNames = require('classnames');

type TMenuItem = {
    icon: string
    title: string
    clickHandler: () => void
    className?: string
    hoverButtons?: React.ReactNode
};

interface IDropdownProps {
    button: JSX.Element
    trigger: string[]
    items: TMenuItem[]
    className?: string
    menuClassName?: string
}

export default class Dropdown extends React.Component <IDropdownProps> {

    getMenuItem = (item: TMenuItem, i: number) =>
        <MenuItem className={classNames(styles.dropdown_item, item.className)} key={i} onClick={item.clickHandler}>
            <div className={item.icon}/>
            <div className={styles.item_text}>{item.title}</div>
            {item.hoverButtons && <div className={styles.item_hoverButtons}>{item.hoverButtons}</div>}
        </MenuItem>;

    render() {
        const {button, trigger, items, className, menuClassName} = this.props;
        return <DropDown
            className={classNames(styles.root, className)}
            trigger={trigger}
            overlay={<Menu className={classNames(styles.dropdown_block, menuClassName)}>
                {items.map((item, index) => this.getMenuItem(item, index))}
            </Menu>
            }
        >
            {button}
        </DropDown>;
    }
}
