import * as React from 'react';
import { IJSFile, IRideFile } from '@stores/FilesStore';
import Button from '@components/Button';
import { SharingService } from '@src/services';
import { NotificationService } from '@services/notificationService';
import { inject } from 'mobx-react';

interface IInjectedProps {
    sharingService?: SharingService
    notificationService?: NotificationService
}

interface IProps extends IInjectedProps {
    file: IJSFile | IRideFile
}

@inject('sharingService', 'notificationService')
export default class ShareFileButton extends React.Component<IProps> {

    handleClick = () => {
        const {sharingService, file, notificationService} = this.props;
        sharingService!.shareableLink(file).then(link => {
            notificationService!.notify(link, {key: 'share-file-link', duration: 10, closable: true});
        });
    };

    render() {
        return <Button type="action-gray" onClick={this.handleClick}>
            Share file
        </Button>;
    }
}
