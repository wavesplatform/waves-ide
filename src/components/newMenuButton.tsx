import * as React from "react"
import {Popover, FontIcon} from 'material-ui'
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {connect} from 'react-redux'
import {loadSample, newEditorTab, openWizard} from '../actions'
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
        return (<span>
        <Button
            variant="text"
            aria-owns={anchorEl ? 'new-menu' : null}
            aria-haspopup="true"
            onClick={this.handleClick}
            children={[<FontIcon className="material-icons">add</FontIcon>, 'New']}
            //label='New'
            //backgroundColor={palette.accent1Color}
            //hoverColor='#ffb3cb'
            //style={{color: 'white', backgroundColor: '#1f5af6', marginLeft: 30, paddingBottom: 37}}
        />
          <Menu id="new-menu"
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={this.handleClose}
          >
            <MenuItem onClick={() => this.clear()}>
                <FontIcon className="material-icons">insert_drive_file</FontIcon>
                Empty contract
            </MenuItem>
              <MenuItem
                  // menuItems={[
                  // <MenuItem children="Simple" onClick={() => this.handleLoadSample('simple')}/>,
                  // <MenuItem children="Multisig (2 of 3)" onClick={() => this.handleLoadSample('multisig')}/>,
                  // <MenuItem children="Notary" onClick={() => this.handleLoadSample('notary')}/>,
                  // ]}
              >
                  <FontIcon className="material-icons">remove_red_eye</FontIcon>
                  Sample
                  <FontIcon className="material-icons">arrow_right</FontIcon>
              </MenuItem>
              <MenuItem>
                  <FontIcon className="material-icons">flash_on</FontIcon>
                  Wizard
                  <FontIcon className="material-icons">arrow_right</FontIcon>
              </MenuItem>
              {/*<MenuItem primaryText="Wizard"*/}
              {/*leftIcon={<FontIcon className="material-icons">flash_on</FontIcon>}*/}
              {/*rightIcon={<FontIcon className="material-icons">arrow_right</FontIcon>}*/}
              {/*menuItems={[*/}
              {/*<MenuItem primaryText="Multisig" onClick={() => this.handleWizard('multisig')}/>*/}
              {/*]}*/}
              />
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
