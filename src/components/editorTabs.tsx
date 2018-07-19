import * as React from "react"
import { connect } from "react-redux"
import { IconButton, Tab, Tabs } from "material-ui"
import { IAppState } from "./../state"
import { closeEditorTab, selectEditorTab } from './../store'

const mapStateToProps = (state: IAppState) => ({
  titles: state.coding.editors.map((x, i) => 'Contract ' + (i + 1)),
  selectedIndex: state.coding.selectedEditor
})

const mapDispatchToProps = (dispatch) => ({
  handleClose: (index: number) =>
    dispatch(closeEditorTab(index)),
  handleSelect: (index: number) =>
    dispatch(selectEditorTab(index))
})

const editorTabs = ({ titles, selectedIndex, handleSelect, handleClose }) => {
  const t = titles.map((title, index) =>
    <Tab key={index} value={index} style={{ width: 200 }} label={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>{title}</span>
        <IconButton tooltip="Close" style={{ color: 'white' }} onClick={() => handleClose(index)}>
          <i className="material-icons">close</i>
        </IconButton>
      </div>
    } />
  )

  return (
    <Tabs onChange={(value) => handleSelect(value)} style={{ float: 'left' }} value={selectedIndex}>
      {t}
    </Tabs>
  )
}

export const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(editorTabs)