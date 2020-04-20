import React from 'react';
import { inject } from 'mobx-react';
import { FILE_TYPE, FilesStore } from '@stores';
import Dropdown from '@src/components/Dropdown';
import styles from './styles.less';
import { logToTagManager } from '@utils/logToTagManager';

interface IInjectedProps {
    filesStore?: FilesStore
}


export const menuItems = {
    'Account script': {
        icon: 'accountdocIcn', content: '{-# STDLIB_VERSION 4 #-}\n' +
            '{-# CONTENT_TYPE EXPRESSION #-}\n' +
            '{-# SCRIPT_TYPE ACCOUNT #-}\n\n' +
            'sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)'
    },
    'Asset script': {
        icon: 'assetdocIcn', content: '{-# STDLIB_VERSION 4 #-}\n' +
            '{-# CONTENT_TYPE EXPRESSION #-}\n' +
            '{-# SCRIPT_TYPE ASSET #-}\n\n' +
            'true'
    },
    'dApp script': {
        icon: 'dappdocIcn', content: `
{-# STDLIB_VERSION 4 #-}
{-# CONTENT_TYPE DAPP #-}
{-# SCRIPT_TYPE ACCOUNT #-}

@Callable(i)
func call() = {
  let asset = Issue("Asset", "", 1, 0, true, unit, 0)
  let assetId = asset.calculateAssetId()
  
  # Script execution results
  # More details in docs: https://docs.wavesplatform.com/en/ride/functions/callable-function#callable-functions-in-standard-library-v4 
  [
    BinaryEntry("bin", base58''), # possible base16, base58, base64
    BooleanEntry("bool", true),
    IntegerEntry("int", 1),
    StringEntry("str", ""),
    DeleteEntry("str"),
    asset,
    Reissue(assetId, false, 1),
    Burn(assetId, 1),
    ScriptTransfer(i.caller, 1, assetId)
  ]
}

@Verifier(tx)
func verify() = sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)
        `
            // '{-# STDLIB_VERSION 4 #-}\n' +
            // '{-# CONTENT_TYPE DAPP #-}\n' +
            // '{-# SCRIPT_TYPE ACCOUNT #-}\n\n' +
            // '@Callable(i)\n' +
            // 'func foo() = {\n' +
            // '    WriteSet([])\n' +
            // '}\n' +
            // '\n' +
            // '# @Verifier(tx)\n' +
            // '# func standardVerifier() = sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)'
    },
    //todo uncomment when imports are supported
    // 'Library': {
    //     icon: 'librarydocIcn', content: '{-# SCRIPT_TYPE  ACCOUNT #-}\n' +
    //         '{-# CONTENT_TYPE LIBRARY #-}' +
    //         '\n{-# STDLIB_VERSION 3 #-}'
    // },
    'Test': {
        icon: 'testdocIcn', content: 'const wvs = 1e8 \n' +
            'describe(\'some suite\', () => {\n' +
            '    // before(async() => {\n' +
            '    //     await setupAccounts({foo: 1 * wvs, bar: 2 * wvs})\n' +
            '    // })\n' +
            '      \n' +
            '    it(\'logs something\', async () => {\n' +
            '        console.log(\'foo\')\n' +
            '    })\n' +
            '})'
    }

};

interface INewFileBtnProps {
    position: 'explorer' | 'topBar'
}

@inject('filesStore')
export default class NewFileBtn extends React.Component<IInjectedProps & INewFileBtnProps> {

    handleClick = (title: string, content: string) => () => {
        const type = title === 'Test' ? FILE_TYPE.JAVA_SCRIPT : FILE_TYPE.RIDE;
        this.props.filesStore!.createFile({type, content}, true)
            .then(() => logToTagManager({event: 'ideFileCreate', fileType: type}));
    };

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
