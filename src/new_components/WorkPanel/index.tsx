import * as React from 'react';
import { inject, observer } from 'mobx-react';
import withStyles, { StyledComponentProps } from 'react-jss';

import Editor from '@components/Editor';
import { Intro } from '@components/intro';
import LogoIcon from '@components/icons/Logo';

import Explorer from '../Explorer';
import SidePanelFooter from '../SidePanelFooter';
import SidePanelResizableWrapper from '../SidePanelResizableWrapper';
import MainPanelFooter from '../MainPanelFooter';

import { FilesStore } from '@stores';

import styles from './styles';
import TabsContainer from '@src/new_components/Tabs';
import TabContent from '@src/new_components/TabContent';

interface IInjectedProps {
    filesStore?: FilesStore
}

interface IAppProps extends StyledComponentProps<keyof ReturnType<typeof styles>>,
    IInjectedProps {
}

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
                            <Explorer/>
                        </div>

                        <div className={classes!.sidePanel_footer}>
                            <SidePanelFooter/>
                        </div>
                    </SidePanelResizableWrapper>
                </div>

                <div className={classes!.mainPanel}>

                    <div className={classes!.mainPanel_header}>
                        <TabsContainer className={classes!.mainPanel_tabs}/>
                        <div className={classes!.mainPanel_account}>
                            account
                        </div>
                        <div className={classes!.mainPanel_settings}>
                            settings
                        </div>
                    </div>

                    <div className={classes!.mainPanel_content}>
                        {filesStore!.rootStore.tabsStore.tabs.length > 0
                            ? <TabContent/>
                            : <Intro/>
                        }
                    </div>

                    <div className={classes!.mainPanel_footer}>
                        <MainPanelFooter/>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(WorkPanel);
