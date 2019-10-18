const axios = require('axios');
const fs = require('fs');
const path = require('path');

const filePath = '../src/json-data/ride-examples.json';

const categories = ['smart-accounts', 'smart-assets', 'ride4dapps'];

const apiEndpoint = 'https://api.github.com/repos/wavesplatform/ride-examples/contents/';

async function updateExamples() {

    const content = require(filePath);

    const repoInfoResp = await axios.get(apiEndpoint,
        {headers: {'If-None-Match': content.eTag}, validateStatus: () => true});

    if (repoInfoResp.status !== 200) {
        // Logging
        if (repoInfoResp.status !== 304) {
            console.error('Failed to get examples repository info');
        } else {
            console.log(`Examples are up to date. Etag: ${content.eTag}`);
        }
        return;
    }

    const foldersToSync = repoInfoResp.data.filter((item) => categories.includes(item.name));

    async function syncContent(oldContent, remoteInfo) {
        let resultContent = [];

        for (let remoteItem of remoteInfo) {
            // If content hasn't changed push local item
            const localItem = oldContent.find(item => item.sha === remoteItem.sha);
            if (localItem) {
                resultContent.push(localItem);
                continue;
            }

            if (remoteItem.type === 'file') {
                const content = await axios.get(remoteItem.download_url).then(r => r.data);
                const ext = remoteItem.name.split('.')[remoteItem.name.split('.').length - 1];
                if (['ride', 'js', 'md'].includes(ext)) {
                    resultContent.push({
                        name: remoteItem.name,
                        content,
                        type: ext,
                        id: remoteItem.path,
                        sha: remoteItem.sha,
                        readonly: true,
                    });
                }

            } else if (remoteItem.type === 'dir') {
                const folderInfo = await axios.get(remoteItem.url).then(r => r.data);
                const localFolder = oldContent.find(item => item.name === remoteItem.name);
                const localContent = localFolder && Array.isArray(localFolder.content) ? localFolder.content : [];
                resultContent.push({
                    name: remoteItem.name,
                    sha: remoteItem.sha,
                    content: await syncContent(localContent, folderInfo)
                });
            }

        }
        return resultContent;
    }

    content.folders = await syncContent(content.folders, foldersToSync);
    content.eTag = repoInfoResp.headers.etag;

    fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(content))
}

updateExamples();
