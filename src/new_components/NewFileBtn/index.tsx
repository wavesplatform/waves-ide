import React from 'react';
import { inject } from 'mobx-react';
import { FILE_TYPE, FilesStore } from '@stores';
import Dropdown from 'rc-dropdown';
import styles from './styles.less';
import Menu from 'rc-menu';

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
        icon: 'assetdoc-16-basic-600', content: '{-# STDLIB_VERSION 3 #-}\n' +
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


const Item = ({title, content, icon, onClick}: any) => (
    <div key={title} className={styles['dropdown-item']} onClick={onClick}>
        <div className={icon}/>
        <div className={styles['item-text']}>{title}</div>
    </div>
);

@inject('filesStore')
export default class NewFileBtn extends React.Component<IInjectedProps> {

    handleClick = (type: FILE_TYPE, content: string) => () => this.props.filesStore!.createFile({type, content}, true);

    render() {
        return (
            <Dropdown
                trigger={['click']}
                overlay={<Menu className={styles['dropdown-block']}>
                    {Object.entries(menuItems).map(([title, {icon, content}]) => (
                        <Item key={title}
                              title={title}
                              className={styles['dropdown-item']}
                              onClick={this.handleClick(title === 'Test' ?
                                  FILE_TYPE.JAVA_SCRIPT :
                                  FILE_TYPE.RIDE,
                                  content)}
                              icon={icon}
                              content={content}
                        >
                        </Item>
                    ))}
                </Menu>}
            >
                <div className={styles['new-file-btn']}>
                    <div className={styles['circle-hover']}>
                        <div className={'accountdoc-16-basic-700'}/>
                    </div>
                </div>
            </Dropdown>
        );
    }
}