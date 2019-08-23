import React from 'react';
import classnames from 'classnames';
import Explorer from '@src/components/Explorer';
import styles from './styles.less';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import NewFileBtn from '@components/NewFileBtn';
import DownloadBtn from '@components/SidePanel/DownloadBtn';
import SignTxBtn from '@components/SidePanel/SignTxBtn';


export interface IProps extends IResizableProps {
    isDarkTheme: boolean
}

class SidePanel extends React.Component<IProps> {
    render() {
        const {isOpened} = this.props;
        let expanderClasses = classnames(styles.expander, {[styles.expander__isOpened]: isOpened});
        return (
            <div className={classnames(styles.root, {[styles['root-dark']]: this.props.isDarkTheme})}>
                <div className={styles.header}>
                    {isOpened && <div className={styles.header_logo}/>}
                    <div className={expanderClasses} onClick={this.props.handleExpand}/>
                </div>
                <div className={styles.content}>
                    {isOpened && <Explorer/>}
                </div>
                <div className={styles.footer}>
                    {isOpened && <><NewFileBtn position="explorer"/>
                        <DownloadBtn/>
                        <SignTxBtn/>
                    </>}
                </div>
            </div>
        );
    }
}

export default withResizableWrapper(SidePanel);
