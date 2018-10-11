import * as React from "react"
import MenuItem from '@material-ui/core/MenuItem';
import {MenuItemProps} from "@material-ui/core/MenuItem";
import Menu from '@material-ui/core/Menu';

interface IExtendedMenuItemProps extends MenuItemProps {
    menuItems?: React.ReactNode[]
}

export default class ExtendedMenuItem extends React.Component<IExtendedMenuItemProps, { anchorEl: any }> {

    constructor(props: IExtendedMenuItemProps) {
        super(props);
        this.state = {
            anchorEl: null
        }
    }
    handleItemClick = event => {
        this.setState({
            anchorEl: event.currentTarget
        });
    };
    handleClose = () => this.setState({anchorEl: null});

    render() {
        const {children, menuItems, ...rest} = this.props;
        const {anchorEl} = this.state;
        return <React.Fragment>
            <MenuItem {...rest}
                      onClick={this.handleItemClick}
            >{children}
            </MenuItem>
            {menuItems.length > 0 &&
            <Menu open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={this.handleClose}
                  anchorOrigin={{
                      vertical: "top",
                      horizontal: "right"
                  }}
                  transformOrigin={{
                      vertical: "top",
                      horizontal: "left"
                  }}
            >
                {menuItems}
            </Menu>

            }
        </React.Fragment>
    }
}