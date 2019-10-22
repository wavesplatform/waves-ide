import React from 'react';
import DropDown from 'rc-dropdown';
import Menu, { MenuItem } from 'rc-menu';
import styles from './styles.less';
import classNames from 'classnames';

export type TMenuItem = {
    icon?: string
    title: string
    clickHandler: () => void
    className?: string
    hoverButtons?: React.ReactNode
};

interface IDropdownProps {
    button: JSX.Element
    trigger: string[]
    items?: TMenuItem[]
    overlay?: JSX.Element
    className?: string
    menuClassName?: string
    alignPoint?: boolean
}

export default class Dropdown extends React.Component <IDropdownProps> {

    getMenuItem = (item: TMenuItem, i: number) =>
        <MenuItem className={classNames(styles.dropdown_item, item.className)} key={i} onClick={item.clickHandler}>
            {item.icon && <div className={item.icon}/>}
            <div className={styles.item_text}>{item.title}</div>
            {item.hoverButtons && <div className={styles.item_hoverButtons}>{item.hoverButtons}</div>}
        </MenuItem>;

    render() {
        const {button, trigger, items, className, menuClassName, alignPoint, overlay} = this.props;
        return <DropDown
            className={classNames(styles.root, className)}
            trigger={trigger}
            alignPoint={alignPoint}
            overlay={
                <Menu className={classNames(styles.dropdown_block, menuClassName)}>
                    {items ? items.map((item, index) => this.getMenuItem(item, index)) : overlay}
                </Menu>

            }
        >
            {button}
        </DropDown>;
    }
}
