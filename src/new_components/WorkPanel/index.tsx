import * as React from 'react';
import { inject, observer } from 'mobx-react';
import withStyles, { StyledComponentProps } from 'react-jss';

import Editor from '@components/Editor';
import EditorTabs from '@components/EditorTabs';
import { Intro } from '@components/intro';
import FileExplorer from '@components/FileExplorer';
import LogoIcon from '@components/icons/Logo';
import NewMenuButton from '@components/TopBar/NewMenuButton';
import { ToolsButton } from '@components/TopBar/ToolsButton';

import SidePanelResizableWrapper from '../SidePanelResizableWrapper';

import { FilesStore } from '@stores';

import styles from './styles';

interface IInjectedProps {
    filesStore?: FilesStore
}

interface IAppProps extends
    StyledComponentProps<keyof ReturnType<typeof styles>>,
    IInjectedProps {}

@inject('filesStore')
@observer
class WorkPanel extends React.Component<IAppProps> {
    render() {
        const {
            classes,
            filesStore
        } = this.props;

        return (
            <div className={classes!.workPanel}>
                <div className={classes!.sidePanel}>
                    <SidePanelResizableWrapper>
                        <div className={classes!.sidePanel_header}>
                            <LogoIcon/>
                        </div>

                        <div className={classes!.sidePanel_content}>
                            <FileExplorer/>
                        </div>

                        <div className={classes!.sidePanel_footer}>
                            <NewMenuButton/>
                            <ToolsButton/>
                        </div>
                    </SidePanelResizableWrapper>
                </div>

                <div className={classes!.mainPanel}>
                    <div className={classes!.mainPanel_header}>
                        <div className={classes!.mainPanel_tabs}>
                            {filesStore!.rootStore.tabsStore.tabs.length > 0 && <EditorTabs/>}
                        </div>
                        <div className={classes!.mainPanel_account}>
                            account
                        </div>
                        <div className={classes!.mainPanel_settings}>
                            settings
                        </div>
                    </div>

                    <div className={classes!.mainPanel_content}>
                        {filesStore!.rootStore.tabsStore.tabs.length > 0
                            ? <Editor/>
                            : <Intro/>
                        }
                    </div>

                    <div className={classes!.mainPanel_footer}>
                        mainPanel_footer
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(WorkPanel);
