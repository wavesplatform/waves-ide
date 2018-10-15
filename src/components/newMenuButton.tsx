import * as React from "react"
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {connect} from 'react-redux'
import {loadSample, newEditorTab, openWizard} from '../actions'
import EMenuItem from './lib/ExtendedMenuItem'
import {palette} from '../style'


class NewMenuButtonComponent extends React.Component
    <{
        onLoadSample: (key: string) => void
        onNewContract: (code: string) => void
        onWizard: (kind: string) => void
    }, { anchorEl: any }> {


    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        }
    }

    handleClick = (event: React.MouseEvent<{}>) => {
        //event.preventDefault();
        this.setState({anchorEl: event.currentTarget})
    }

    handleClose = () => {
        this.setState({anchorEl: null});
    }

    handleLoadSample = (key: string) => {
        this.handleClose()
        this.props.onLoadSample(key)
    }

    handleWizard = (kind: string) => {
        this.handleClose()
        this.props.onWizard(kind)
    }

    clear = () => {
        this.handleClose()
        this.props.onNewContract('')
    }

    render() {
        const {anchorEl} = this.state
        return (
        <span>
            <Button
                variant="text"
                aria-owns={anchorEl ? 'new-menu' : null}
                aria-haspopup="true"
                onClick={this.handleClick}
                style={{color: 'white', backgroundColor: '#1f5af6', marginLeft: 30}}
            >
                <Icon className="material-icons">add</Icon>
                New
            </Button>
            <Menu id="new-menu"
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={this.handleClose}
                  getContentAnchorEl={null}
                  anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left"
                  }}
                  transformOrigin={{
                      vertical: "top",
                      horizontal: "left"
                  }}
            >
                <MenuItem onClick={() => this.clear()}>
                    <Icon className="material-icons" style={{color: "#757575", marginRight: 24}}>insert_drive_file</Icon>
                    Empty contract
                    <Icon className="material-icons" style={{color: "#757575", left: "auto"}}></Icon>
                </MenuItem>
                <EMenuItem
                    menuItems={[
                        <MenuItem children="Simple" onClick={() => this.handleLoadSample('simple')}/>,
                        <MenuItem children="Multisig (2 of 3)" onClick={() => this.handleLoadSample('multisig')}/>,
                        <MenuItem children="Notary" onClick={() => this.handleLoadSample('notary')}/>,
                    ]}
                >
                    <Icon className="material-icons" style={{color: "#757575", marginRight: 24}}>remove_red_eye</Icon>
                    Sample
                    <Icon className="material-icons" style={{color: "#757575", marginLeft: "auto"}}>arrow_right</Icon>
                </EMenuItem>
                <EMenuItem
                    menuItems={[
                        <MenuItem children="Multisig" onClick={() => this.handleWizard('multisig')}/>
                    ]}
                >
                    <Icon className="material-icons" style={{color: "#757575", marginRight: 24}}>flash_on</Icon>
                    Wizard
                    <Icon className="material-icons" style={{color: "#757575", marginLeft: "auto"}}>arrow_right</Icon>
                </EMenuItem>
            </Menu>
          </span>
        )
    }
}


const mapDispatchToProps = (dispatch) => ({
    onLoadSample: (key: any) =>
        dispatch(loadSample(key)),
    onNewContract: (code: string) =>
        dispatch(newEditorTab(code)),
    onWizard: (kind: string) =>
        dispatch(openWizard(kind))
})

export const NewMenuButton = connect(null, mapDispatchToProps)(NewMenuButtonComponent)


