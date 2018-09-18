import * as React from "react"
import {connect} from "react-redux"
import {IconButton, SvgIcon, Tab, Tabs} from "material-ui"
import {IAppState} from "../state"
import {closeEditorTab, selectEditorTab, renameEditorTab} from '../store'
import {userDialog} from "./userDialog"

class EditorTab extends React.Component<{ index, text, handleClose, handleRename }> {
  isEditing: boolean

  constructor(props) {
    super(props)
  }

  render() {
    const {index, text, handleClose, handleRename} = this.props
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
      }} onKeyDown={(e) => {
        if (e.key.toLowerCase() == 'enter') {
          e.preventDefault()
          this.isEditing = false
          this.forceUpdate()
        }
      }}/>] : [<span key="1" style={{flex: 2}}>{text}</span>,
        <IconButton key="2" tooltip="Edit" disableFocusRipple={true} disableTouchRipple={true}
                    style={{color: 'white', width: '30px'}} iconStyle={{width: 16}} onClick={(e) => {
          this.isEditing = true
          this.forceUpdate()
        }}>
          <SvgIcon viewBox="0 0 14 14" style={{width: 16, height: 16}}>
            <g fill="none" fill-rule="evenodd">
              <path fill="none" d="M-1-1h14v14H-1z"/>
              <path fill="#9BA6B2" fill-rule="nonzero"
                    d="M6.684 3.337l.707-.707L9.68 4.918l-.707.707-2.288-2.288zm-5.682 7.686l1.78-.01 8.027-8.027-1.771-1.79L7.67 2.571 1.01 9.216l-.009 1.807zm1.979-.01a.43.43 0 0 0-.004 0h.004zM.013 9.019c0-.14.063-.266.152-.368l6.8-6.786L8.663.152a.536.536 0 0 1 .748 0l2.436 2.461a.536.536 0 0 1 0 .749l-8.5 8.498a.508.508 0 0 1-.367.153l-2.46.012a.508.508 0 0 1-.369-.152.537.537 0 0 1-.152-.38l.013-2.474z"/>
            </g>
          </SvgIcon>
        </IconButton>,
        <IconButton key="3" tooltip="Close" disableFocusRipple={true} disableTouchRipple={true}
                    style={{flex: 1, color: 'white', width: '10px'}} iconStyle={{width: 16}} onClick={(e) => {
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
          <SvgIcon viewBox="0 0 14 14" style={{width: 16}}>
            <g fill="none" fill-rule="evenodd" width="16" height="16">
              <path fill="none" d="M-1-1h14v14H-1z"/>
              <path fill="#9BA6B2" fill-rule="nonzero"
                    d="M6.364 5.657l4.95 4.95-.707.707-4.95-4.95-4.95 4.95L0 10.607l4.95-4.95L0 .707.707 0l4.95 4.95L10.607 0l.707.707-4.95 4.95z"/>
            </g>
          </SvgIcon>
        </IconButton>
      ]
      }

    </div>
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

const editorTabs = ({titles, selectedIndex, handleSelect, handleClose, handleRename}) => {
  const t = titles.map((title, index) => <Tab key={index} value={index} style={{
    width: 200,
    textTransform: 'none',
    backgroundColor: '#f8f9fb',
    color: '#4e5c6e'
  }}
                                              label={
                                                <EditorTab index={index} text={title} handleClose={handleClose}
                                                           handleRename={handleRename}/>
                                              }/>)

  return (
    <Tabs
      inkBarStyle={{backgroundColor: '#1f5af6'}}
      onChange={(value) => handleSelect(value)} style={{float: 'left'}} value={selectedIndex}>
      {t}
    </Tabs>
  )
}

export const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(editorTabs)