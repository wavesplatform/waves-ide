import * as React from "react"
import { AppBar, IconButton, IconMenu, MenuItem, RaisedButton, Popover, Menu, FlatButton, FontIcon } from 'material-ui'
import { connect } from 'react-redux'
import { loadSample, editorCodeChange } from './../store'
import { palette } from './../style'
import { IAppState } from "../state"

export default class newMenuButton extends React.Component
  <{
    onLoadSample: (key: string) => void
    onEditorCodeChanged: (code: string) => void
  }> {
  isMenuOpen = false
  anchorEl = null

  constructor(props) {
    super(props);
  }

  handleClick(event: React.MouseEvent<{}>) {
    event.preventDefault();
    this.isMenuOpen = true
    this.anchorEl = event.currentTarget
    this.forceUpdate()
  }

  handleMenuClose() {
    this.isMenuOpen = false
    this.forceUpdate()
  }

  handleLoadSmaple(key: string) {
    this.handleMenuClose()
    this.props.onLoadSample(key)
  }

  clear() {
    this.handleMenuClose()
    this.props.onEditorCodeChanged('')
  }

  render() {
    return (
      <span>
        <FlatButton
          onClick={(e) => this.handleClick(e)}
          icon={<FontIcon className="material-icons">add</FontIcon>}
          label='NEW'
          backgroundColor={palette.accent1Color}
          hoverColor='#ffb3cb'
          style={{ color: 'white', marginLeft: 30, paddingBottom: 37 }}
        />
        <Popover
          open={this.isMenuOpen}
          anchorEl={this.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={(e) => this.handleMenuClose()}>
          <Menu>
            <MenuItem primaryText="Empty contract"
              leftIcon={<FontIcon className="material-icons">insert_drive_file</FontIcon>}
              onClick={() => this.clear()}
            />
            <MenuItem primaryText="Smaple"
              leftIcon={<FontIcon className="material-icons">remove_red_eye</FontIcon>}
              rightIcon={<FontIcon className="material-icons">arrow_right</FontIcon>}
              menuItems={[
                <MenuItem primaryText="Simple" onClick={() => this.handleLoadSmaple('simple')} />,
                <MenuItem primaryText="Multisig (2 of 3)" onClick={() => this.handleLoadSmaple('multisig')} />,
                <MenuItem primaryText="Notary" onClick={() => this.handleLoadSmaple('notary')} />,
              ]}
            />
          </Menu>
        </Popover>
      </span>
    )
  }
}

const mapStateToProps = (state: IAppState) => {
  return ({ code: state.coding.editors[state.coding.selectedEditor].code })
}

const mapDispatchToProps = (dispatch) => ({
  onLoadSample: (key: any) =>
    dispatch(loadSample(key)),
  onEditorCodeChanged: (code: string) =>
    dispatch(editorCodeChange(code))
})

export const NewMenuButton = connect(null, mapDispatchToProps)(newMenuButton)
