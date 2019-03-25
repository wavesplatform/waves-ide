import React from 'react';
import { inject, observer } from 'mobx-react';
import 'rc-notification/assets/index.css';
import { FilesStore, FILE_TYPE } from '@stores';
import ContractFooter from './ContractFooter';
import EmptyFooter from './EmptyFooter';
import TestFooter from './TestFooter';
import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
}

@inject('filesStore')
@observer
class MainPanelFooter extends React.Component <IInjectedProps> {
    render() {
        const {filesStore} = this.props;
        const file = filesStore!.currentFile;
        let footer;
        if (!file) {
            footer = <EmptyFooter className={styles!.root}/>;
        } else if (file.type === FILE_TYPE.TEST) {
            footer = <TestFooter className={styles!.root}/>;
        } else if ((file.type === FILE_TYPE.ASSET_SCRIPT || file.type === FILE_TYPE.ACCOUNT_SCRIPT)) {
            footer = <ContractFooter className={styles!.root} file={file}/>;
        }
        return footer;
    }
}

export default (MainPanelFooter);
