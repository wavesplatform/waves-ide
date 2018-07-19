import * as React from "react"
import { AppBar } from 'material-ui'
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
