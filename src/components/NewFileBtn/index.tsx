import React from 'react';
import { inject } from 'mobx-react';
import { FILE_TYPE, FilesStore } from '@stores';
import Dropdown from '@src/components/Dropdown';
import styles from './styles.less';

interface IInjectedProps {
    filesStore?: FilesStore
}

export const menuItems = {
    'Account script': {
        icon: 'accountdocIcn', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE EXPRESSION #-}\n' +
            '{-# SCRIPT_TYPE ACCOUNT #-}'
    },
    'Asset script': {
        icon: 'assetdocIcn', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE EXPRESSION #-}\n' +
            '{-# SCRIPT_TYPE ASSET #-}'
    },
    'dApp script': {
        icon: 'dappdocIcn', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE DAPP #-}\n' +
            '{-# SCRIPT_TYPE ACCOUNT #-}'
    },
    'Library': {
        icon: 'librarydocIcn', content: '{-# SCRIPT_TYPE  ACCOUNT #-}\n' +
            '{-# CONTENT_TYPE LIBRARY #-}' +
            '\n{-# STDLIB_VERSION 3 #-}'
    },
    'Test': {icon: 'testdocIcn', content: ''}
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
        <div className={styles.add16Icn}/>
        :
        <div className={styles['new-file-btn-small']} title="Create new file">
            <div className={styles.add24Icn}/>
        </div>
    ;

    render() {
        const {position} = this.props;
        return <Dropdown
            button={this.buttonElement(position)}
            trigger={['click']}
            items={Object.entries(menuItems).map(([title, {icon, content}]) => ({
                    icon: styles[icon],
                    title: title,
                    clickHandler: this.handleClick(title, content)
                })
            )}
        />;
    }
}
