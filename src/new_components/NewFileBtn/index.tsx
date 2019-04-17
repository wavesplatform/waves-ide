import React from 'react';
import { inject } from 'mobx-react';
import { FILE_TYPE, FilesStore } from '@stores';
import Dropdown from '@src/new_components/Dropdown';
import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
}

const menuItems = {
    'Account script': {
        icon: 'accountdoc-16-basic-600', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE EXPRESSION #-}\n' +
            '{-# SCRIPT_TYPE ACCOUNT #-}'
    },
    'Asset script': {
        icon: 'assetdoc-diamond-16-basic-600', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE EXPRESSION #-}\n' +
            '{-# SCRIPT_TYPE ASSET #-}'
    },
    'DApp': {
        icon: 'accountdoc-16-basic-600', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE DAPP #-}\n' +
            '{-# SCRIPT_TYPE ACCOUNT #-}'
    },
    'Test': {icon: 'accountdoc-16-basic-600', content: ''}
};

interface INewFileBtnProps {
    position: 'explorer' | 'topBar'
}

@inject('filesStore')
export default class NewFileBtn extends React.Component<IInjectedProps & INewFileBtnProps> {

    handleClick = (title: string, content: string) => () => this.props.filesStore!.createFile({
        type: title === 'Test' ? FILE_TYPE.JAVA_SCRIPT : FILE_TYPE.RIDE, content
    }, true);

    buttonElement = (position: string) => position === 'topBar' ?
        <div className={styles['new-file-btn']}>
            <div className={styles['circle-hover']}>
                <div className={'accountdoc-16-basic-700'}/>
            </div>
        </div>
        :
        <div className={styles['new-file-btn-small']}>
            <div className="add-18-basic-600"/>
        </div>
        ;

    render() {
        const {position} = this.props;
        return <Dropdown
            button={this.buttonElement(position)}
            trigger={['click']}
            items={Object.entries(menuItems).map(([title, {icon, content}]) => ({
                    icon: icon,
                    title: title,
                    clickHandler: this.handleClick(title, content)
                })
            )}
        />;
    }
}
