import * as React from 'react';
import { IJSFile, IRideFile } from '@stores/FilesStore';
import Button from '@components/Button';
import { SharingService } from '@src/services';
import { inject } from 'mobx-react';
import styles from './styles.less';
import NotificationsStore from '@stores/NotificationsStore';
import { logToTagManager } from '@utils/logToTagManager';
import { copySync } from '@utils/copyText';

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
                if (copySync(link)) {
                    notificationsStore!.success(`Link ${link} has been copied`,
                        {key: 'share-file-link', duration: 20});
                }
                logToTagManager({event: 'ideGetShareLink'});
            })
            .catch(({message: msg}) => {
                notificationsStore!.error(`File share failed: ${msg}`,
                    {key: 'share-file-link', duration: 5});
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
