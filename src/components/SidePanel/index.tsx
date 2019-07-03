import React from 'react';
import classnames from 'classnames';

import { UIStore } from '@stores';

import Explorer from '@src/components/Explorer';
import Footer from './footer';

import styles from './styles.less';
import { IWrappedProps, withResizableWrapper } from '@components/ResizableWrapper';

interface IInjectedProps {
    uiStore?: UIStore
}

interface IProps extends IInjectedProps, IWrappedProps {
}

class SidePanel extends React.Component<IProps> {
    render() {
        const {isOpened} = this.props;
        let expanderClasses = classnames(styles.expander, {[styles.expander__isOpened]: isOpened});
        return (
            <div className={styles.root}>
                <div className={styles.header}>
                    {isOpened && <div className={styles.header_logo}/>}
                    <div className={expanderClasses} onClick={this.props.handleExpand}/>
                </div>
                <div className={styles.content}>
                    {isOpened && <Explorer/>}
                </div>
                <Footer/>
            </div>
        );
    }
}

export default withResizableWrapper(SidePanel);
