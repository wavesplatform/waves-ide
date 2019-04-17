import React from 'react';
import { inject, observer, IWrappedComponent } from 'mobx-react';
import classnames from 'classnames';

import { UIStore } from '@stores';

import LogoIcon from '@components/icons/Logo';
import Explorer from '@src/new_components/Explorer';
import SidePanelFooter from '@src/new_components/SidePanelFooter';
import SidePanelResizableWrapper from '@src/new_components/SidePanelResizableWrapper';

import styles from './styles.less';

interface IInjectedProps {
    uiStore?: UIStore
}

interface IProps extends IInjectedProps {}

@inject('uiStore')
@observer
class SidePanel extends React.Component<IProps> {
    // TO DO uncomment when mobx-react@6.0.0 be would be released
    // private resizableWrapperRef = React.createRef<IWrappedComponent<sidePanelResizableWrapper>>();
    private resizableWrapperRef = React.createRef<any>();

    private handleSidePanelExpand = () => {
        const resizableWrapperInstance = this.resizableWrapperRef.current.wrappedInstance;

        resizableWrapperInstance && resizableWrapperInstance.expand();
    }

    render() {
        const { uiStore } = this.props;

        const { isOpened } = uiStore!.sidePanel;

        let expanderClasses = classnames(
            styles.expander,
            {[styles.expander__isOpened]: isOpened}
        );

        return (
            <SidePanelResizableWrapper ref={this.resizableWrapperRef}>
                <div className={styles.root}>
                    <div className={styles.header}>
                        {isOpened && <div className={styles.header_logo}><LogoIcon/></div>}
                        <div className={expanderClasses} onClick={this.handleSidePanelExpand}/>
                    </div>

                    <div className={styles.content}>
                        {isOpened && <Explorer/>}
                    </div>

                    <div className={styles.footer}>
                        <SidePanelFooter/>
                    </div>

                </div>
            </SidePanelResizableWrapper>
        );
    }
}

export default SidePanel;
