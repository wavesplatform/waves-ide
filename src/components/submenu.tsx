import * as React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import withStyles from "@material-ui/core/styles/withStyles";
import classNames from "classnames";
import Menu from '@material-ui/core/Menu';
import {MenuProps} from "@material-ui/core/Menu";

const styles = {
    subMenuItem: {
        display: "flex",
        justifyContent: "space-between"
    }
};

class SubMenuComponent extends React.Component<{caption, menuItems, classes}, {menuOpen: boolean, anchorElement: any}> {
    private anchorElement: any;

    constructor(props) {
        super(props);

        this.state = {
            menuOpen: false,
            anchorElement: null
        };
    }

    handleItemClick = event => {
        if (!this.anchorElement) {
            this.setState({
                anchorElement: event.currentTarget
            });
        }

        this.setState({
            menuOpen: !this.state.menuOpen
        });
    };

    handleSubMenuClose = () => {
        this.setState({
            menuOpen: false
        });
    };

    render() {
        const { caption, menuItems, classes } = this.props;
        const { anchorElement, menuOpen } = this.state;
        return (
            <React.Fragment>
                <MenuItem
                    onClick={this.handleItemClick}
                    className={classNames(classes.subMenuItem)}
                >
                    {caption}
                    <ArrowRightIcon />
                </MenuItem>
                <EnhancedMenu
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                    open={menuOpen}
                    menuItems={menuItems}
                    anchorElement={anchorElement}
                    onClose={this.handleSubMenuClose}
                />
            </React.Fragment>
        );
    }
}
const SubMenu = withStyles(styles)(SubMenuComponent);

interface MenuItemObj {
    key: string
    caption: string
    onClick?: any
    subMenuItems?: MenuItemObj[]
}
interface INestedMenuProps extends MenuProps {
    menuItems: MenuItemObj[]
    anchorElement
}
export default class EnhancedMenu extends React.Component<INestedMenuProps> {
    renderMenuItems = () => {
        const { menuItems } = this.props;
        return menuItems.map(menuItem => {
            if (menuItem.hasOwnProperty("subMenuItems")) {
                return (
                    <SubMenu
                        key={menuItem.key}
                        caption={menuItem.caption}
                        menuItems={menuItem.subMenuItems}
                    />
                );
            }

            return (
                <MenuItem key={menuItem.key} onClick={menuItem.onClick}>
                    {menuItem.caption}
                </MenuItem>
            );
        });
    };

    render() {
        const { anchorElement, open, onClose, ...others } = this.props;
        return (
            <Menu
                {...others}
                anchorEl={anchorElement}
                open={open}
                onClose={onClose}
            >
                {this.renderMenuItems()}
            </Menu>
        );
    }
}



