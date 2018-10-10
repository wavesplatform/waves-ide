import * as React from "react"
import {connect} from "react-redux"
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tooltip from '@material-ui/core/Tooltip';
import {IAppState} from "../reducers"
import {closeEditorTab, selectEditorTab, renameEditorTab} from '../actions'
import {userDialog} from "./userDialog"


class EditorTab extends React.Component<{ index, text, handleClose, handleRename }, { isEditing: boolean }> {

    constructor(props) {
        super(props)
        this.state = {
            isEditing: false
        }
    }

    handleEnter = (e) => {
        if (e.key.toLowerCase() == 'enter') {
            e.preventDefault()
            this.setState({isEditing: false})
        }
    };

    handleFocus = (e) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length)
    };

    render() {
        const {index, text, handleClose, handleRename} = this.props
        const {isEditing} = this.state
        return <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around'
            }}>
            {isEditing
                ?
                <input onChange={(e) => {
                    handleRename(index, e.target.value)
                }}
                       readOnly={false}
                       onFocus={this.handleFocus}
                       value={text}
                       autoFocus={true}
                       onBlur={() => this.setState({isEditing: false})}
                       onKeyDown={this.handleEnter}/>
                :
                [
                    <span key="1" style={{flex: 2}}>{text}</span>,
                    <Tooltip key="2" title="Edit">
                        <IconButton
                                    disableRipple={true}
                                    disableTouchRipple={true}
                                    style={{
                                        flex: 1,
                                        color: 'white',
                                        paddingLeft: '20px',
                                        width: '10px',
                                        backgroundColor: 'transparent'
                                    }}
                                    onClick={() => this.setState({isEditing: true})}>

                            <SvgIcon viewBox="0 0 14 14" style={{width: 16, height: 16}}>
                                <g fill="none" fillRule="evenodd">
                                    <path fill="none" d="M-1-1h14v14H-1z"/>
                                    <path fill="#9BA6B2" fillRule="nonzero"
                                          d="M6.684 3.337l.707-.707L9.68 4.918l-.707.707-2.288-2.288zm-5.682 7.686l1.78-.01 8.027-8.027-1.771-1.79L7.67 2.571 1.01 9.216l-.009 1.807zm1.979-.01a.43.43 0 0 0-.004 0h.004zM.013 9.019c0-.14.063-.266.152-.368l6.8-6.786L8.663.152a.536.536 0 0 1 .748 0l2.436 2.461a.536.536 0 0 1 0 .749l-8.5 8.498a.508.508 0 0 1-.367.153l-2.46.012a.508.508 0 0 1-.369-.152.537.537 0 0 1-.152-.38l.013-2.474z"/>
                                </g>
                            </SvgIcon>
                        </IconButton>
                    </Tooltip>,
                    <Tooltip key="3" title="Close">
                        <IconButton
                                    disableRipple={true}
                                    disableTouchRipple={true}
                                    focusRipple={false}
                                    style={{flex: 1, color: 'white', width: '10px', backgroundColor: 'transparent'}}
                                    onClick={() => {
                                        userDialog.open("Close", <p>Are you sure you want to close&nbsp;
                                            <b>{text}</b>&nbsp;?</p>, {
                                            "Cancel": () => {
                                                return true
                                            },
                                            "Close": () => {
                                                handleClose(index)
                                                return true
                                            }
                                        })
                                    }}>
                            <SvgIcon viewBox="0 0 14 14" style={{width: 16, height: 16}}>
                                <g fill="none" fillRule="evenodd" width="16" height="16">
                                    <path fill="none" d="M-1-1h14v14H-1z"/>
                                    <path fill="#9BA6B2" fillRule="nonzero"
                                          d="M6.364 5.657l4.95 4.95-.707.707-4.95-4.95-4.95 4.95L0 10.607l4.95-4.95L0 .707.707 0l4.95 4.95L10.607 0l.707.707-4.95 4.95z"/>
                                </g>
                            </SvgIcon>
                        </IconButton>
                    </Tooltip>
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
    console.log(selectedIndex)
    const tabs = titles.map((title, index) => (
        <Tab key={index}
             value={index}
             style={{
                 width: 200,
                 textTransform: 'none',
                 backgroundColor: '#f8f9fb',
                 color: '#4e5c6e'
             }}
             label={
                 <EditorTab index={index} text={title} key={index}
                            handleClose={handleClose}
                            handleRename={handleRename}/>
             }/>
    ));

    return (
        <div>
            <Tabs
                centered
                onChange={(_, value) => handleSelect(value)}
                style={{float: 'left'}}
                value={selectedIndex}>
                {tabs}
            </Tabs>
        </div>
    )
}

export const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(editorTabs)