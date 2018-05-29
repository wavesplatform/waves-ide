import * as React from "react"
import { AppBar, IconButton, IconMenu, MenuItem, RaisedButton, Popover, Menu, FlatButton, FontIcon } from 'material-ui'
import { connect } from 'react-redux'
import { loadSample } from './../store'
import { palette } from './../style'
import { IAppState } from "../state"
import { NewMenuButton } from './newMenuButton'

export const TopBar = () => (
  <AppBar
    title={<div>
      Waves IDE
      <NewMenuButton />
    </div>}
    iconElementLeft={< div />}
  />
)
