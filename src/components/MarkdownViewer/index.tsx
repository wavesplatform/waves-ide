import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './styles.less';
import { FilesStore } from '@stores';
import { inject, observer } from 'mobx-react';
import Scrollbar from '@components/Scrollbar';

interface IProps {
    fileId: string
    filesStore?: FilesStore
}

@inject('filesStore')
@observer
export default class MarkdownViewer extends React.Component <IProps> {
    render(): React.ReactNode {
        const file = this.props.filesStore!.fileById(this.props.fileId);
        return file
            ? <Scrollbar className={styles.root}>
                <ReactMarkdown className={styles.markdownEditor} source={file.content}/>
            </Scrollbar>
            : null;
    }
}

