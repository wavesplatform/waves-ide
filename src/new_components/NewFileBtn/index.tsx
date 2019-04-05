import React from 'react';
import { inject } from 'mobx-react';
import { FilesStore } from '@stores';
import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
}
@inject('filesStore')
export default class NewFileBtn extends React.Component<IInjectedProps> {
    render(){
        const {filesStore} =  this.props;
        const create = filesStore!.createFile;

        return <div className={styles['new-file-btn']}>
            <div className={styles['circle-hover']}>
                <div className={'accountdoc-16-basic-700'}/>
            </div>
        </div>
    }
}