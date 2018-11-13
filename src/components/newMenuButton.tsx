import * as React from "react"
import {RouteComponentProps, withRouter} from 'react-router'
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {connect, Dispatch} from 'react-redux'
import {newEditorTab} from '../store/coding/actions'
import EMenuItem from './lib/ExtendedMenuItem'
import {codeSamples, sampleTypes} from '../samples'
import {RootAction} from "../store";

class NewMenuButtonComponent extends React.Component
    <RouteComponentProps & {
        onLoadSample: (key: sampleTypes) => any
        onNewContract: (code: string) => any
    }, { anchorEl: any }> {

    public state = {
        anchorEl: null
    }

    handleClick = (event: React.MouseEvent<{}>) => {
        //event.preventDefault();
        this.setState({anchorEl: event.currentTarget})
    }

    handleClose = () => {
        this.setState({anchorEl: null});
    }

    handleLoadSample = (key: sampleTypes) => {
        this.handleClose()
        this.props.onLoadSample(key)
    }

    handleWizard = (kind: string) => {
        const {history} =  this.props;
        this.handleClose()
        history.push(`wizard/${kind}`)
    }

    clear = () => {
        this.handleClose()
        this.props.onNewContract('')
    }

    render() {
        const {anchorEl} = this.state;

        return (
        <span>
            <Button
                variant="text"
                aria-owns={anchorEl ? 'new-menu' : undefined}
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
            </Menu>
          </span>
        )
    }
}


const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    onLoadSample: (key: sampleTypes) =>
        dispatch(newEditorTab({code: codeSamples[key]})),
    onNewContract: (code: string) =>
        dispatch(newEditorTab({code}))
})

export const NewMenuButton = connect(null, mapDispatchToProps)(withRouter(NewMenuButtonComponent))


