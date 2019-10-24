import * as React from 'react';
import { IJSFile, IRideFile } from '@stores/FilesStore';
import Button from '@components/Button';
import { SharingService } from '@src/services';
import { inject } from 'mobx-react';
import copyToClipboard from 'copy-to-clipboard';
import styles from './styles.less';
import NotificationsStore from '@stores/NotificationsStore';
import { logToTagManager } from '@utils/logToTagManager';

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
        const d = sharingService!.shareableLink(file)
        d.then(link => {
            if (copyToClipboard(link)) {
                notificationsStore!.notify(`Link ${link} has been copied`,
                    {key: 'share-file-link', duration: 5, closable: true});
            }
            logToTagManager({event: 'ideGetShareLink'});
        })
            .catch(({message: msg}) => {
                if (msg === 'Request failed with status code 413') msg += ': File too large.';
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
