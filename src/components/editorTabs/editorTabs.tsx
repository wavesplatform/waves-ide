import React, {Component, KeyboardEvent} from "react"
import {connect, Dispatch} from "react-redux"
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {RootAction, RootState} from "../../store"
import {closeEditorTab, selectEditorTab, renameEditorTab} from '../../store/coding/actions'

import {EditorTab} from "./editorTab";

const mapStateToProps = (state: RootState) => ({
    titles: state.coding.editors.map((x, i) => x.label),
    selectedIndex: state.coding.selectedEditor
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    handleClose: (index: number) =>
        dispatch(closeEditorTab(index)),
    handleSelect: (index: number) =>
        dispatch(selectEditorTab(index)),
    handleRename: (index: number, label: string) =>
        dispatch(renameEditorTab({index, label}))

})

interface IEditorTabsComponentProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>{
}


class EditorTabsComponent extends Component<IEditorTabsComponentProps, any> {
    currentTabNode:any;

    // scrollToCurrentTab() {
    //     if (!this.currentTabNode) {
    //         return;
    //     }
    //
    //     // Dirty hack for Google Chrome
    //     setTimeout(() => {
    //         this.currentTabNode.scrollIntoView({behavior: 'smooth'});
    //     }, 0);
    // }
    //
    // componentDidUpdate() {
    //    // this.scrollToCurrentTab();
    // }
    //
    // componentDidMount() {
    //    // this.scrollToCurrentTab();
    // }

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
                 buttonRef={(el:any) => {
                     if (index === selectedIndex) {
                         this.currentTabNode = el;
                     }
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

export const EditorTabs = connect(mapStateToProps, mapDispatchToProps)(EditorTabsComponent)