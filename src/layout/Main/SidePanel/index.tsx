import React from 'react';
import cn from 'classnames';
import Explorer from './Explorer';
import styles from './styles.less';
import { IResizableProps, withResizableWrapper } from '@components/HOC/ResizableWrapper';
import NewFileBtn from '@components/NewFileBtn';
import DownloadBtn from './DownloadBtn';
import SignTxBtn from './SignTxBtn';


export interface IProps extends IResizableProps {
}

class SidePanel extends React.Component<IProps> {
    render() {
        const {isOpened} = this.props;
        let expanderClasses = cn(styles.expander, {[styles.expander__isOpened]: isOpened});
        return (
            <div className={styles.root}>
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
