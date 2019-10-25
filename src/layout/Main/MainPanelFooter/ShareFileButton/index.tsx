import * as React from 'react';
import { IJSFile, IRideFile } from '@stores/FilesStore';
import Button from '@components/Button';
import { SharingService } from '@src/services';
import { inject } from 'mobx-react';
import copyToClipboard from 'copy-to-clipboard';
import styles from './styles.less';
import NotificationsStore from '@stores/NotificationsStore';
import { logToTagManager } from '@utils/logToTagManager';
import { isString } from "@waves/ride-language-server/suggestions";

interface IInjectedProps {
    sharingService?: SharingService
    notificationsStore?: NotificationsStore
}

interface IProps extends IInjectedProps {
    file: IJSFile | IRideFile
}

const TITLE = 'Saves file to server and copies link to clipboard';

@inject('sharingService', 'notificationsStore')
export default class ShareFileButton extends React.Component<IProps> {

    handleClick = () => {
        const {sharingService, file, notificationsStore} = this.props;
        sharingService!.shareableLink(file)
            .then(link => {
                if (!isString(link)) throw link.error;
                if (copyToClipboard(link)) {
                    notificationsStore!.notify(`Link ${link} has been copied`,
                        {key: 'share-file-link', duration: 5, closable: true});
                }
                logToTagManager({event: 'ideGetShareLink'});
            })
            .catch(({message: msg}) => {
                notificationsStore!.notify(`File share failed: ${msg}`,
                    {key: 'share-file-link', duration: 2, closable: true});
            });
    };

    render() {
        return <Button type="action-gray"
                       onClick={this.handleClick}
                       title={TITLE}
                       icon={<div className={styles.shareIcn}/>}
        >
            Share file
        </Button>;
    }
}
