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
            '{-# SCRIPT_TYPE ACCOUNT #-}\n\n' +
            'sigVerify(tx.bodyBytes, tx.proofs[0], tx.sender.bytes)'
    },
    'Asset script': {
        icon: 'assetdocIcn', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE EXPRESSION #-}\n' +
            '{-# SCRIPT_TYPE ASSET #-}\n\n' +
            'true'
    },
    'dApp script': {
        icon: 'dappdocIcn', content: '{-# STDLIB_VERSION 3 #-}\n' +
            '{-# CONTENT_TYPE DAPP #-}\n' +
            '{-# SCRIPT_TYPE ACCOUNT #-}\n\n' +
            '@Callable(i)\n' +
            'func foo() = {\n' +
            '    WriteSet([])\n' +
            '}\n' +
            '\n' +
            '# @Verifier(tx)\n' +
            '# func standardVerifier() = sigVerify(tx.bodyBytes, tx.proofs[0], tx.sender.bytes)'
    },
    //todo uncomment when imports are supported
    // 'Library': {
    //     icon: 'librarydocIcn', content: '{-# SCRIPT_TYPE  ACCOUNT #-}\n' +
    //         '{-# CONTENT_TYPE LIBRARY #-}' +
    //         '\n{-# STDLIB_VERSION 3 #-}'
    // },
    'Test': {icon: 'testdocIcn', content: 'const wvs = 10e8 \n' +
            'describe(\'some suite\', () => {\n' +
            '    before(async() => {\n' +
            '        await setupAccounts({foo: 1 * wvs, bar: 2 * wvs})\n' +
            '    })\n' +
            '      \n' +
            '    it(\'logs something\', async () => {\n' +
            '        console.log(\'foo\')\n' +
            '    })\n' +
            '})'}
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
