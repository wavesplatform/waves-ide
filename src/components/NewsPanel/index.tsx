import React from 'react';
import { inject, observer } from 'mobx-react';
import ReactMarkdown from 'react-markdown';
import ScrollBar from 'react-perfect-scrollbar';
import classNames from 'classnames';

import { NewsStore } from '@stores';
import styles from './styles.less';

interface IProps {
    newsStore?: NewsStore
}

@inject('newsStore')
@observer
export default class ImportAccountDialog extends React.Component<IProps> {
    handleClose = (id: string) => () => {
        const { newsStore } = this.props;

        newsStore!.closePost(id)
    };

    render() {
        const { newsStore } = this.props;

        const post = newsStore!.newsPanelPost

        if (!post) return null

        return (
            <div className={styles.root}>
                <ScrollBar className={styles.markdownEditor}>
                    <ReactMarkdown source={post.text} linkTarget={'_blank'}/>
                </ScrollBar>

                <div className={styles.closeBtn} onClick={this.handleClose(post.id)}/>
            </div>
        )
    }
}
