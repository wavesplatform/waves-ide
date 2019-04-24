import React, { Component } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabLabel from './EditorTab';
import { FilesStore, TabsStore, FILE_TYPE, TTab, IFile, TAB_TYPE } from '@stores';

import { inject, observer } from 'mobx-react';




// const mapStateToProps = (state: RootState) => ({
//     openedFiles: state.editors.editors.map((x, i) => state.files.find(file => file.id === x.fileId) || UNKNOWN_FILE),
//     selectedIndex: state.editors.selectedEditor
// });
//
// const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
//     handleClose: (index: number) =>
//         dispatch(closeEditorTab(index)),
//     handleSelect: (index: number) =>
//         dispatch(selectEditorTab(index)),
//     onRename: (fileId: string, label: string) =>
//         dispatch(renameFile({id: fileId, name: label}))
//
// });
interface IInjectedProps {
    tabsStore?: TabsStore
    filesStore?: FilesStore
}

interface IEditorTabsProps extends IInjectedProps {
}

@inject('tabsStore', 'filesStore')
@observer
class EditorTabs extends Component<IEditorTabsProps, any> {

    render() {
        const { tabsStore, filesStore } = this.props;
        // const {openedFiles, selectedIndex, handleSelect, handleClose, onRename} = this.props;

        const tabs = tabsStore!.tabs;
        const tabsComponents = tabs.map((tab: TTab, index: number) => {
            const file = tab.type === TAB_TYPE.EDITOR && filesStore!.fileById(tab.fileId);

            return <Tab key={index}
                        component="div"
                        value={index}
                        style={{
                            width: 175,
                            height: 45,
                            textTransform: 'none',
                            backgroundColor: '#f8f9fb',
                            color: '#4e5c6e'
                        }}
                        label={
                            <TabLabel index={index} text={file ? file.name : 'Welcome'} key={index}
                                      handleClose={ (i: number) => tabsStore!.closeTab(i)}
                                      handleRename={file ? (text) => filesStore!.renameFile(file.id, text) : undefined}/>
                        }/>
        });

        const selectedIndex = tabsStore!.activeTabIndex;

        return (
            <Tabs style={{backgroundColor: 'rgb(248, 249, 251)'}}
                  variant="scrollable"
                  indicatorColor="primary"
                  onChange={(_, value) => tabsStore!.selectTab(value)}
                  value={selectedIndex}>
                {tabsComponents}
            </Tabs>
        );
    }
}

export default EditorTabs;
