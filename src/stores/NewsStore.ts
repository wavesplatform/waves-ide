import { action, computed, observable, runInAction } from 'mobx';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

import RootStore from '@stores/RootStore';
import SubStore from '@stores/SubStore';

type TPost = {
    id: string
    text: string
}

type TGithubDataItem = {
    download_url: string
    git_url: string
    html_url: string
    name: string
    path: string
    sha: string
    size: number
    type: 'file' | 'dir'
    url: string
}

class NewsStore extends SubStore {
    @observable news: TPost[] = []
    @observable closedNewsIds: string[] = []

    constructor(rootStore: RootStore, initState: any) {
        super(rootStore);
        if (initState != null) {
            this.news = observable(initState.news);
            this.closedNewsIds = initState.closedNewsIds;
        }

        this.updateNews()
            .catch(e => console.error(`Error occurred while updating news: ${e}`));
    }

    public serialize = () => ({
        news: this.news,
        closedNewsIds: this.closedNewsIds
    });

    @computed
    get isNewsPanelVisible() {
        return this.newsPanelPost
            ? !this.closedNewsIds.includes(this.newsPanelPost.id)
            : false
    }

    @computed
    get newsPanelPost() {
        const lastPost = this.news[this.news.length - 1]

        return lastPost ? lastPost : undefined
    }

    @action
    private async updateNews() {
        const newsFileUrl = `https://raw.githubusercontent.com/wavesplatform/waves-ide/master/news.json?rand=${uuid()}`;

        try {
            const newsRes = await axios.get<TPost[]>(newsFileUrl);

            if (newsRes.data instanceof Array) {
                runInAction(() => {
                    this.news = newsRes.data
                });
            }
        } catch (error) {
            console.error('Failed to get news');
        }
    }

    @action
     closePost(id: string) {
        this.closedNewsIds.push(id)
    }
}

export {
    NewsStore,
};


