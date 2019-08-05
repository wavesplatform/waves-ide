import { History } from 'history';
import RootStore from '@stores/RootStore';
import { IFile } from '@stores/FilesStore';
import axios from 'axios';

export class SharingService {
    constructor(private mobXStore: RootStore, private history: History) {
        let shareMatch = history.location.pathname.match(/s\/([a-f0-9]{24})$/);
        if (shareMatch != null) {
            const shareId = shareMatch[1];
            this.fileById(shareId)
                .then(remoteFile => {
                    let localFile = mobXStore.filesStore.files.find(file => file.content === remoteFile.content);
                    if (!localFile) {
                        localFile = mobXStore.filesStore.createFile(remoteFile);
                    }
                    mobXStore.tabsStore.openFile(localFile.id);
                })
                .catch(err => console.error(err))
                .finally(() => history.push('/'));
        }
    }

    async shareableLink(file: IFile): Promise<string> {
        return axios.post('api/v1/saveFile', file)
            .then(data => `${window.location.origin}/s/${data.data}`);
    }

    async fileById(id: string): Promise<IFile> {
        return axios.get(`api/v1/getFile/${id}`)
            .then(data => data.data);
    }
}
