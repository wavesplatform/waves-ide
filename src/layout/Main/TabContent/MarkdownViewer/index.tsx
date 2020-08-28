import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './styles.less';
import { FilesStore } from '@stores';
import { inject, observer } from 'mobx-react';
import Scrollbar from '@components/Scrollbar';

interface IProps {
    fileId?: string
    content?: string
    filesStore?: FilesStore
}

@inject('filesStore')
@observer
export default class MarkdownViewer extends React.Component <IProps> {
    render(): React.ReactNode {
        const file = this.props.fileId && this.props.filesStore!.fileById(this.props.fileId) ;
        return file || this.props.content
            ? <Scrollbar className={styles.root}>
                <ReactMarkdown
                    className={styles.markdownEditor}
                    source={file && file.content || this.props.content}
                    linkTarget={'_blank'}
                />
            </Scrollbar>
            : null;
    }
}
