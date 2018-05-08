import * as React from "react"
import { AppBar, IconButton, IconMenu, MenuItem } from 'material-ui'
import { connect } from 'react-redux'
import { loadSample } from './../store'

const mapDispatchToProps = (dispatch) => ({
  onLoadSample: id => {
    dispatch(loadSample(id))
  }
})

const topBar = ({ onLoadSample }) => (
  <AppBar
    title={<span>Waves IDE</span>}
    iconElementLeft={<div />}
    iconElementRight={
      <IconMenu
        iconButtonElement={
          <IconButton iconClassName="muidocs-icon-navigation-expand-more"></IconButton>
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem primaryText="Simple" onClick={() => onLoadSample('simple')} />
        <MenuItem primaryText="Multisig (2 of 3)" onClick={() => onLoadSample('multisig')} />
        <MenuItem primaryText="Notary" onClick={() => onLoadSample('notary')} />
      </IconMenu>
    }
  />
)

export const TopBar = connect(null, mapDispatchToProps)(topBar)