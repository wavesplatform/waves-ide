import * as React from "react"
import { Provider, connect } from "react-redux"
import { render } from "react-dom"
import { Badge, IconButton, Tab, Tabs } from "material-ui"
import { IAppState } from "./../state"

const mapStateToProps = (state: IAppState) => ({ titles: ['Contract 1'] })

const mapDispatchToProps = (dispatch) => ({
  onCopy: () => {
    //dispatch(notifyUser("Coppied!"))
  }
})

const editorTabs = ({ titles }) => {
  const t = titles.map(title =>
    <Tab key={title} disableTouchRipple={true} style={{ width: 200 }} label={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>{title}</span>
        <IconButton tooltip="Close" style={{ color: 'white' }}>
          <i className="material-icons">close</i>
        </IconButton>
      </div>
    } />
  )

  return (
    <Tabs style={{ float: 'left' }}>
      {t}
    </Tabs>
  )
}

export const EditorTabs = connect(mapStateToProps)(editorTabs)