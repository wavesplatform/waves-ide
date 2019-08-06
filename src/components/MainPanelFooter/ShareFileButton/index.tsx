import * as React from 'react';
import { IJSFile, IRideFile } from '@stores/FilesStore';
import Button from '@components/Button';
import { SharingService } from '@src/services';
import { NotificationService } from '@services/notificationService';
import { inject } from 'mobx-react';
import { copyToClipboard } from '@utils/copyToClipboard';

interface IInjectedProps {
    sharingService?: SharingService
    notificationService?: NotificationService
}

interface IProps extends IInjectedProps {
    file: IJSFile | IRideFile
}

const TITLE = 'Saves file to server and copies link to clipboard';

@inject('sharingService', 'notificationService')
export default class ShareFileButton extends React.Component<IProps> {

    handleClick = () => {
        const {sharingService, file, notificationService} = this.props;
        sharingService!.shareableLink(file)
            .then(link => {
                if (copyToClipboard(link)) {
                    notificationService!.notify(`Link ${link} has been copied`,
                        {key: 'share-file-link', duration: 5, closable: true});
                }
            })
            .catch(e => {
                notificationService!.notify(`File share failed: ${e.message}`,
                    {key: 'share-file-link', duration: 2, closable: true});
            });
    };

    render() {
        return <Button type="action-gray"
                       onClick={this.handleClick}
                       title={TITLE}
                       icon={<div className={'share-18-basic-700'}/>}
        >
            Share file
        </Button>;
    }
}
