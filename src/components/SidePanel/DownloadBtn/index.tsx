import React from 'react';
import styles from './styles.less';
import { saveAs } from 'file-saver';
import { FilesStore } from '@stores';
import { inject, observer } from 'mobx-react';

interface IInjectedProps {
    filesStore?: FilesStore
}


@inject('filesStore')
@observer
class DownloadBtn extends React.Component<IInjectedProps> {
    handleClick = () => this.props.filesStore!.files.map(file =>
        saveAs(new Blob([file.content], {type: 'text/plain;charset=utf-8'}), file.name)
    );

    render() {
        return <div className={styles.root} onClick={this.handleClick}/>;
    }
}

export default DownloadBtn;
