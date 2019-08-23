import React from 'react';
import styles from './styles.less';
import { saveAs } from 'file-saver';
import { FILE_TYPE, FilesStore, UIStore } from '@stores';
import { inject, observer } from 'mobx-react';
import JSZip from 'jszip';
import classnames from 'classnames';
interface IInjectedProps {
    filesStore?: FilesStore
    uiStore?: UIStore
}


@inject('filesStore', 'uiStore')
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
        const isDarkTheme = this.props.uiStore!.editorSettings.isDarkTheme;
        return  <div
            className={classnames(styles.root, {[styles['root-dark']]: isDarkTheme})}
            onClick={this.handleClick}
            title="Download all files as zip archive"
        />;
    }
}

export default DownloadBtn;
