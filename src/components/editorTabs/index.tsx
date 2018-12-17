import React, {Component, KeyboardEvent} from "react"
import {connect, Dispatch} from "react-redux"
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {RootAction, RootState} from "../../store"
import {closeEditorTab, selectEditorTab, renameEditorTab} from '../../store/coding/actions'
import EditorTab from "./editorTab";

const mapStateToProps = (state: RootState) => ({
    titles: state.editors.editors.map((x, i) => x.label),
    selectedIndex: state.editors.selectedEditor
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    handleClose: (index: number) =>
        dispatch(closeEditorTab(index)),
    handleSelect: (index: number) =>
        dispatch(selectEditorTab(index)),
    handleRename: (index: number, label: string) =>
        dispatch(renameEditorTab({index, label}))

})

interface IEditorTabsProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>{
}


class EditorTabs extends Component<IEditorTabsProps, any> {

    render() {
        const {titles, selectedIndex, handleSelect, handleClose, handleRename} = this.props;

        const tabs = titles.map((title:string, index: number) => (
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
                     <EditorTab index={index} text={title} key={index}
                                handleClose={handleClose}
                                handleRename={handleRename} />
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