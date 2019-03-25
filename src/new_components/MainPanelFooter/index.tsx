import React from 'react';
import { inject, observer } from 'mobx-react';

import { FilesStore, FILE_TYPE } from '@stores';

import ContractFooter from './ContractFooter';
import DefaultFooter from './DefaultFooter';
import TestFooter from './TestFooter';

interface IInjectedProps {
    filesStore?: FilesStore
}

interface IProps extends IInjectedProps {
    className?: string
}

@inject('filesStore')
@observer
class MainPanelFooter extends React.Component <IProps> {
    render() {
        const {
            className,
            filesStore
        } = this.props;

        const file = filesStore!.currentFile;

        let footer;

        if (!file) {
            footer = <DefaultFooter className={className}/>;
        } else if (file.type === FILE_TYPE.TEST) {
            footer = <TestFooter className={className}/>;
        } else if ((file.type === FILE_TYPE.ASSET_SCRIPT || file.type === FILE_TYPE.ACCOUNT_SCRIPT)) {
            footer = <ContractFooter className={className} file={file}/>;
        }

        return footer;
    }
}

export default (MainPanelFooter);
