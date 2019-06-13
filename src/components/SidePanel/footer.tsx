import React from 'react';
import NewFileBtn from '../NewFileBtn';
import SignTxBtn from './SignTxBtn'
import styles from './styles.less';
import DownloadBtn from './DownloadBtn';

class SidePanelFooter extends React.Component {
    handleSignClick = () => {

    }
    render() {
        return (
            <div className={styles.footer}>
                <NewFileBtn position="explorer"/>
                <SignTxBtn/>
                <DownloadBtn/>
            </div>
        );
    }
}


export default SidePanelFooter;
