import React from 'react';
import styles from './styles.less';
import { saveAs } from 'file-saver';
import { FILE_TYPE, FilesStore } from '@stores';
import { inject, observer } from 'mobx-react';
import JSZip from 'jszip';
interface IInjectedProps {
    filesStore?: FilesStore
}


@inject('filesStore')
@observer
class DownloadBtn extends React.Component<IInjectedProps> {
    handleClick = () => {
        const zip = new JSZip();
        const folders = {
            [FILE_TYPE.RIDE]: zip.folder('ride'),
            [FILE_TYPE.JAVA_SCRIPT]:  zip.folder('test')
        };
        this.props.filesStore!.files.forEach(({name, content, type}) =>
            (type === FILE_TYPE.RIDE || type === FILE_TYPE.JAVA_SCRIPT) &&  folders[type].file(name, content)
        );
        zip.generateAsync({type: 'blob'}).then(function(content) {
            saveAs(content, 'files.zip');
        });
    };


    render() {
        return <div className={styles.root} onClick={this.handleClick} title="Download all files as zip archive"/>;
    }
}

export default DownloadBtn;
