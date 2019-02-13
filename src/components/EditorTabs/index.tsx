import React, {Component} from "react"
import {connect, Dispatch} from "react-redux"
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {RootAction, RootState} from "../../store"
import {closeEditorTab, selectEditorTab} from '../../store/editors/actions'
import {renameFile} from "../../store/files/actions";
import EditorTab from "./EditorTab";
import {FILE_TYPE, FILE_FORMAT, IFile} from "../../store/files/reducer";

const UNKNOWN_FILE: IFile = {
    id: 'UNKNOWN',
    type: FILE_TYPE.ACCOUNT_SCRIPT,
    format: FILE_FORMAT.RIDE,
    name: 'UNKNOWN',
    content: '',
}
const mapStateToProps = (state: RootState) => ({
    openedFiles: state.editors.editors.map((x, i) => state.files.find(file => file.id === x.fileId) || UNKNOWN_FILE),
    selectedIndex: state.editors.selectedEditor
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    handleClose: (index: number) =>
        dispatch(closeEditorTab(index)),
    handleSelect: (index: number) =>
        dispatch(selectEditorTab(index)),
    handleRename: (fileId: string, label: string) =>
        dispatch(renameFile({id:fileId, name:label}))

})

interface IEditorTabsProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>{
}


class EditorTabs extends Component<IEditorTabsProps, any> {

    render() {
        const {openedFiles, selectedIndex, handleSelect, handleClose, handleRename} = this.props;

        const tabs = openedFiles.map((file: IFile, index: number) => (
            <Tab key={index}
                 component='div'
                 value={index}
                 style={{
                     width: 175,
                     height: 45,
                     textTransform: 'none',
                     backgroundColor: '#f8f9fb',
                     color: '#4e5c6e'
                 }}
                 label={
                     <EditorTab index={index} text={file.name} key={index}
                                handleClose={handleClose}
                                handleRename={(text) => handleRename(file.id, text)} />
                 }/>
        ));

        return (
            <Tabs style={{backgroundColor:'rgb(248, 249, 251)'}}
                scrollable
                indicatorColor="primary"
                onChange={(_, value) => handleSelect(value)}
                value={selectedIndex}>
                {tabs}
            </Tabs>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorTabs)