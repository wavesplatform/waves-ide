import React from 'react';
import NewFileBtn from '../NewFileBtn';
import SignTxBtn from './SignTxBtn';
import styles from './styles.less';
import DownloadBtn from './DownloadBtn';

class SidePanelFooter extends React.Component {
    render() {
        return (
            <div className={styles.footer}>
                <div title="Create new file">
                    <NewFileBtn position="explorer"/>
                </div>
                <div title="Download all files">
                    <DownloadBtn/>
                </div>
                <div title="Sign arbitrary content">
                    <SignTxBtn/>
                </div>
            </div>
        );
    }
}


export default SidePanelFooter;
