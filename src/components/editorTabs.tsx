import * as React from "react"
import { connect } from "react-redux"
import { IconButton, Tab, Tabs } from "material-ui"
import { IAppState } from "../state"
import { closeEditorTab, selectEditorTab, renameEditorTab } from '../store'
import { userDialog } from "./userDialog"

class EditorTab extends React.Component<{ index, text, handleClose, handleRename }> {
  isEditing: boolean
  constructor(props) {
    super(props)
  }

  render() {
    const { index, text, handleClose, handleRename } = this.props
    return <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
      }}>
      {this.isEditing ? [<input key="1" onChange={(e) => {
        handleRename(index, e.target.value)
      }} readOnly={false} onFocus={(e) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement)
        input.setSelectionRange(0, input.value.length)
      }} value={text} autoFocus={true} onBlur={() => {
        this.isEditing = false
        this.forceUpdate()
      }} />] : [<span key="1" style={{ flex: 2 }}>{text}</span>,
      <IconButton key="2" tooltip="Edit" disableFocusRipple={true} disableTouchRipple={true} style={{ color: 'white', width: '30px' }} onClick={(e) => {
        this.isEditing = true
        this.forceUpdate()
      }}>
        <i className="material-icons">edit</i>
      </IconButton>,
      <IconButton key="3" tooltip="Close" disableFocusRipple={true} disableTouchRipple={true} style={{ flex: 1, color: 'white', width: '10px' }} onClick={(e) => {
        userDialog.open("Close", <text>{[`Are you sure you want to close `, <b>{text}</b>, ' ?']}</text>, {
          "Cancel": () => {
            return true
          },
          "Close": () => {
            handleClose(index)
            return true
          }
        })
      }}>
        <i className="material-icons">close</i>
      </IconButton>
        ]
      }

    </div >
  }
}


const mapStateToProps = (state: IAppState) => ({
  titles: state.coding.editors.map((x, i) => x.label),
  selectedIndex: state.coding.selectedEditor
})

const mapDispatchToProps = (dispatch) => ({
  handleClose: (index: number) =>
    dispatch(closeEditorTab(index)),
  handleSelect: (index: number) =>
    dispatch(selectEditorTab(index)),
  handleRename: (index: number, text: string) =>
    dispatch(renameEditorTab(index, text))

})

const editorTabs = ({ titles, selectedIndex, handleSelect, handleClose, handleRename }) => {
  const t = titles.map((title, index) => <Tab key={index} value={index} style={{ width: 200, textTransform: 'none' }} label={
    <EditorTab index={index} text={title} handleClose={handleClose} handleRename={handleRename} />
  } />)

  return (
    <Tabs onChange={(value) => handleSelect(value)} style={{ float: 'left' }} value={selectedIndex}>
      {t}
    </Tabs>
  )
}

export const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(editorTabs)