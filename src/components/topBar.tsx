import * as React from "react"
import { AppBar, IconButton } from 'material-ui'
import { NewMenuButton } from './newMenuButton'
import { settingsDialog } from "./settingsDialog";

export const TopBar = () => (
  <AppBar
    title={<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
      Waves IDE
      <NewMenuButton />
      <IconButton style={{ color: 'white' }} onClick={() => {
        settingsDialog.open()
      }} >
        <i className="material-icons">settings</i>
      </IconButton>
    </div>}
    iconElementLeft={< div />}
  />
)
