import * as React from "react"
import {MenuItem, Popover, Menu, FlatButton, FontIcon} from 'material-ui'
import {connect} from 'react-redux'
import {loadSample, newEditorTab, openWizard} from '../actions'
import {palette} from '../style'

class NewMenuButtonComponent extends React.Component
    <{
        onLoadSample: (key: string) => void
        onNewContract: (code: string) => void
        onWizard: (kind: string) => void
    }, { isMenuOpen: boolean, anchorEl: any }> {


    constructor(props) {
        super(props);
        this.state = {
            isMenuOpen: false,
            anchorEl: null
        }
    }

    handleClick(event: React.MouseEvent<{}>) {
        event.preventDefault();
        this.setState({isMenuOpen: true, anchorEl: event.currentTarget})
    }

    handleMenuClose() {
        this.setState({isMenuOpen: false})
    }

    handleLoadSample(key: string) {
        this.handleMenuClose()
        this.props.onLoadSample(key)
    }

    handleWizard(kind: string) {
        this.handleMenuClose()
        this.props.onWizard(kind)
    }

    clear() {
        this.handleMenuClose()
        this.props.onNewContract('')
    }

    render() {
        return (
            <span>
        <FlatButton
            onClick={(e) => this.handleClick(e)}
            icon={<FontIcon className="material-icons">add</FontIcon>}
            label='New'
            backgroundColor={palette.accent1Color}
            hoverColor='#ffb3cb'
            style={{color: 'white', backgroundColor: '#1f5af6', marginLeft: 30, paddingBottom: 37}}
        />
        <Popover
            open={this.state.isMenuOpen}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={(e) => this.handleMenuClose()}>
          <Menu>
            <MenuItem primaryText="Empty contract"
                      leftIcon={<FontIcon className="material-icons">insert_drive_file</FontIcon>}
                      onClick={() => this.clear()}
            />
            <MenuItem primaryText="Sample"
                      leftIcon={<FontIcon className="material-icons">remove_red_eye</FontIcon>}
                      rightIcon={<FontIcon className="material-icons">arrow_right</FontIcon>}
                      menuItems={[
                          <MenuItem primaryText="Simple" onClick={() => this.handleLoadSample('simple')}/>,
                          <MenuItem primaryText="Multisig (2 of 3)" onClick={() => this.handleLoadSample('multisig')}/>,
                          <MenuItem primaryText="Notary" onClick={() => this.handleLoadSample('notary')}/>,
                      ]}
            />
            <MenuItem primaryText="Wizard"
                      leftIcon={<FontIcon className="material-icons">flash_on</FontIcon>}
                      rightIcon={<FontIcon className="material-icons">arrow_right</FontIcon>}
                      menuItems={[
                          <MenuItem primaryText="Multisig" onClick={() => this.handleWizard('multisig')}/>
                      ]}
            />
          </Menu>
        </Popover>
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
