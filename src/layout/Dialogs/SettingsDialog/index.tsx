import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { inject, observer } from 'mobx-react';
import { AccountsStore, SettingsStore } from '@stores';
import Dialog from '@components/Dialog';
import { NodeItem } from './NodeItem';
import Scrollbar from '@src/components/Scrollbar';
import styles from './styles.less';
import Button from '@src/components/Button';
import Link from '@components/Link';
import { logToTagManager } from '@utils/logToTagManager';
import Setting from './Setting';
import Info from './Info';
import { NETWORKS } from '@src/constants';
import FileLoader from '@src/layout/Dialogs/SettingsDialog/FileLoader';
import { IImportedData } from '@stores/SettingsStore';
import { stagenetNewUrl } from '@stores/MigrationStore';

interface IInjectedProps {
    settingsStore?: SettingsStore
    accountsStore?: AccountsStore
}

interface IProps extends RouteComponentProps, IInjectedProps {
}

interface IState {
}


export const Section: React.FunctionComponent = (props) => <div className={styles.section}>{props.children}</div>;
export const Row: React.FunctionComponent = (props) => <div className={styles.row}>{props.children}</div>;
export const SectionHead: React.FunctionComponent = (props) => <div
    className={styles.section_head}>{props.children}</div>;

@inject('settingsStore', 'accountsStore')
@observer
export default class SettingsDialog extends React.Component<IProps, IState> {

    state: IState = {};

    componentDidMount(): void {
        const data = JSON.parse('{"accounts":{"accountGroups":{"W":{"activeAccountIndex":-1,"accounts":[]},"T":{"activeAccountIndex":0,"accounts":[]},"S":{"activeAccountIndex":-1,"accounts":[]},"R":{"activeAccountIndex":0,"accounts":[{"seed":"waves private node seed with waves tokens","label":"master","chainId":"R"}]}}},"files":[{"id":"1ba43c39-672e-4408-99e0-b2a66a68ae0e","content":"{-# STDLIB_VERSION 4 #-}\\n{-# CONTENT_TYPE DAPP #-}\\n{-# SCRIPT_TYPE ACCOUNT #-}\\n\\nlet a = base58\'\'\\nlet blake = blake2b256_16Kb(a) + blake2b256_32Kb(a) + blake2b256_64Kb(a) + blake2b256_128Kb(a)\\nlet keccak = keccak256_16Kb(a) + keccak256_32Kb(a) + keccak256_64Kb(a) + keccak256_128Kb(a)\\nlet sha = sha256_16Kb(a) + sha256_32Kb(a) + sha256_64Kb(a) + sha256_128Kb(a)\\n\\nlet boolean = \\"abc\\".contains(\\"b\\")\\nlet mdn = median([1, 2] ++ [3, 4] :+ 5)\\n\\n@Callable(inv)\\nfunc foo(arr: List[Int]) = {\\n  let asset = Issue(\\"\\", \\"\\", 1, 0, true, unit, 0)\\n  let assetId = asset.calculateAssetId()\\n  let ttx = transferTransactionFromProto(base58\'\')\\n  let root = createMerkleRoot([base58\'\'], base58\'\', 1)\\n\\n  [\\n    BinaryEntry(\\"pmt-asset\\", inv.payments[0].assetId.valueOrElse(base58\'\')),\\n    BooleanEntry(\\"groth\\", groth16Verify_2inputs(base58\'\', base58\'\', base58\'\')),\\n    IntegerEntry(\\"pmt-amount\\", inv.payments.size()),\\n    StringEntry(\\"\\", \\"\\"),\\n    DeleteEntry(\\"\\"),\\n    asset,\\n    Reissue(assetId, false, 1),\\n    Burn(assetId, 1),\\n    ScriptTransfer(inv.caller, 1, unit)\\n  ]\\n}\\n\\n@Verifier(tx)\\nfunc verify() = {\\n  match tx {\\n    case uai: UpdateAssetInfoTransaction => sigVerify_16Kb(uai.bodyBytes, uai.proofs[0], uai.senderPublicKey)\\n    case _ => false\\n  }\\n}","type":"ride","name":"test.ride"},{"id":"27feb9c5-683f-4624-a30d-32c8e8fe2761","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"2f3844e1-5a48-493a-a4ee-dae5ecd804b8","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"6152197b-cf33-484a-8265-e9c4e1014ffb","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"6f492424-ba6c-4e4d-90a0-4c9b5d55f9de","content":"{-# STDLIB_VERSION 4 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ACCOUNT #-}\\n\\nsigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)","type":"ride","name":"file_3.ride"},{"id":"759a93a4-14a3-4af0-afd5-758d1bff16f1","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"80305b6a-7d8e-4918-adfb-605a40398583","content":"\\n{-# STDLIB_VERSION 4 #-}\\n{-# CONTENT_TYPE DAPP #-}\\n{-# SCRIPT_TYPE ACCOUNT #-}\\n\\n@Callable(i)\\nfunc foo(arr: List[Int]) = {\\n        ","type":"ride","name":"file_6.ride"},{"id":"822bc970-b212-48b7-8fbe-18ce5006087f","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"916612a6-4667-4b69-9c66-da664c17779c","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"a384796c-5cb4-405a-8c9d-89aba0f65fda","content":"{-# STDLIB_VERSION 4 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ACCOUNT #-}\\n\\nsigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)","type":"ride","name":"file_4.ride"},{"id":"a51fd9d3-e1f9-43b5-9e8f-cad383a2f62d","content":"const wvs = 1e8\\nconst nodeUrl = \'http://localhost:6869\'\\nconst masterSeed = \'waves private node seed with waves tokens\'\\nconst TIMEOUT = 200000\\n\\ndescribe(\'some suite\', () => {\\n\\n    it(\'logs something\', async () => {\\n        const invokeTx = invokeScript({\\n            dApp: \'3MAjRbSNjxihNaMLnhRM5L1JQtyf81AuAHA\',\\n            call: { function: \'foo\', args: [] },\\n            chainId: 82,\\n            fee: 500000,\\n            feeAssetId: null,\\n        }, masterSeed)\\n        const { id } = await broadcast(invokeTx, nodeUrl)\\n        const tx = (await waitForTx(id, { apiBase: nodeUrl, timeout: TIMEOUT }))\\n        console.log(\'foo\')\\n    })\\n})","type":"js","name":"file_1.js"},{"id":"b202629b-d116-4f40-a7c6-1334926b0637","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"testFile.ride"},{"id":"b46b4486-c7f3-4f04-b699-4c7d9e565a56","content":"{-# STDLIB_VERSION 4 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"file_5.ride"},{"id":"bd6a9ffd-11ff-4539-8fcf-9fe2ef157d51","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"c1fe1677-f41d-4f02-b04f-d9096a19efec","content":"{-# STDLIB_VERSION 4 #-}\\n{-# CONTENT_TYPE DAPP #-}\\n{-# SCRIPT_TYPE ACCOUNT #-}\\n\\n@Callable(i)\\nfunc call() = {\\n  let asset = Issue(\\"Asset\\", \\"\\", 1, 0, true, unit, 0)\\n  let assetId = asset.calculateAssetId()\\n  \\n  # Script execution results\\n  # More details in docs: https://docs.wavesplatform.com/en/ride/functions/callable-function#callable-functions-in-standard-library-v4 \\n  [\\n    BinaryEntry(\\"bin\\", base58\'\'), # possible base16, base58, base64\\n    BooleanEntry(\\"bool\\", true),\\n    IntegerEntry(\\"int\\", 1),\\n    StringEntry(\\"str\\", \\"\\"),\\n    DeleteEntry(\\"str\\"),\\n    asset,\\n    Reissue(assetId, false, 1),\\n    Burn(assetId, 1),\\n    ScriptTransfer(i.caller, 1, assetId)\\n  ]\\n}\\n\\n@Verifier(tx)\\nfunc verify() = sigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)","type":"ride","name":"file_7.ride"},{"id":"c3fb731f-bfb5-49a2-982d-d9a89a94c3dd","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ASSET #-}\\n\\ntrue","type":"ride","name":"test.ride"},{"id":"c4411857-e84a-4afb-9610-d5599e1f29c5","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE DAPP #-}\\n{-# SCRIPT_TYPE ACCOUNT #-}\\n\\n@Callable(i)\\nfunc foo() = {\\n    WriteSet([])\\n}\\n","type":"ride","name":"file_2.ride"},{"id":"efa5c8a0-9576-4965-9e84-dae8c6a533d0","content":"{-# STDLIB_VERSION 3 #-}\\n{-# CONTENT_TYPE EXPRESSION #-}\\n{-# SCRIPT_TYPE ACCOUNT #-}\\n\\nsigVerify(tx.bodyBytes, tx.proofs[0], tx.senderPublicKey)","type":"ride","name":"file_1.ride"}],"customNodes":[{"url":"http://localhost:6869/","chainId":"R","faucet":"https://wavesexplorer.com/testnet/faucet","explorer":"https://wavesexplorer.com/testnet"}]}');
        this.setState({data});
    }

    handleClose = () => this.props.history.push('/');

    handleAddNode = () => {
        this.props.settingsStore!.addNode(NETWORKS.TESTNET);
        logToTagManager({event: 'ideCustomNodeAdd'});
    };

    handleChangeTheme = (val: 'dark' | 'light') => {
        const currentTheme = this.props.settingsStore!.theme;
        if (currentTheme !== val) this.props.settingsStore!.toggleTheme();
    };

    handleChangeAdditionalFee = (strVal: string) => {
        const val = this.validateStringValue(strVal);
        const store = this.props.settingsStore!;
        store.defaultAdditionalFee = val;
    };

    handleChangeTimeout = (field: 'node' | 'test') => (strVal: string) => {
        const val = this.validateStringValue(strVal);
        const store = this.props.settingsStore!;
        store.updateTimeout(val, field);
    };

    validateStringValue = (stringValue: string) => {
        let val = +stringValue;
        if (isNaN(val)) val = 0;
        if (val >= 1e10) val = 1e10;
        return val;
    };

    handleExportState = () => this.props.settingsStore!.exportState();

    handleSetLoadedState = (data: IImportedData) => {
        if (data.accounts && data.customNodes && data.files) {
            this.props.settingsStore!.importStorageData = data;
            this.props.history.push('/importState');
        }
    };

    render() {
        const {defaultAdditionalFee, nodeTimeout, testTimeout, theme} = this.props.settingsStore!;
        const themeOptions = [{title: 'Light', value: 'light'}, {title: 'Dark', value: 'dark'}];
        return <>
            <Dialog
                title="Settings"
                footer={<Button type="action-blue" className={styles.ok} onClick={this.handleClose}>Close</Button>}
                onClose={this.handleClose}
                className={styles.root}
                width={618}
                visible
            >
                <Scrollbar className={styles.content}>
                    <Row>
                        <Section>
                            <SectionHead>Theme</SectionHead>
                            <Setting onChange={this.handleChangeTheme}
                                     value={theme.toString()}
                                     title="IDE Color scheme"
                                     select={themeOptions}
                            />
                        </Section>
                        <Section>
                            <SectionHead>Default additional fee</SectionHead>
                            <Setting onChange={this.handleChangeAdditionalFee}
                                     value={defaultAdditionalFee.toString()}
                                     title="Amount in wavelets"
                                     info={<Info infoType="DefaultAdditionalFee"/>}
                            />
                        </Section>
                    </Row>
                    <Section>
                        <SectionHead>Timeout</SectionHead>
                        <Row>
                            <Setting onChange={this.handleChangeTimeout('node')}
                                     value={nodeTimeout.toString()}
                                     title="NodeRequest"
                                     info={<Info infoType="NodeTimeout"/>}
                            />
                            <Setting onChange={this.handleChangeTimeout('test')}
                                     value={testTimeout.toString()}
                                     title="Tests"
                                     info={<Info infoType="TestTimeout"/>}
                            />
                        </Row>
                    </Section>
                    <Section>
                        <SectionHead>Default nodes</SectionHead>
                        {this.props.settingsStore!.systemNodes.map((node, i) => (
                            <NodeItem key={i} node={node} index={i}/>
                        ))}

                        <div className={styles.nonSystemNodes}>
                            <div className={styles.nonSystemNodes_title}>
                                Stagenet URL
                            </div>

                            <div className={styles.nonSystemNodes_content}>
                                <div>
                                    Dear user, the IDE for the stagenet network has moved to&nbsp;
                                    <Link className={styles.link} href={stagenetNewUrl}>
                                        {(stagenetNewUrl as string).replace(/^https?:\/\//, '')}
                                    </Link>
                                    . For convenience, you can transfer your projects using import/export.
                                </div>

                                <div>
                                    <Link className={styles.link} href={stagenetNewUrl}>
                                        Go to Stagenet IDE
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Section>
                    <Section>
                        <SectionHead>Custom nodes</SectionHead>
                        {this.props.settingsStore!.customNodes.map((node, i) => (
                            <NodeItem key={i} node={node} index={i + 3}/>
                        ))}
                    </Section>
                    <Button className={styles.addNodeBtn} type="add-block" onClick={this.handleAddNode}>Add
                        node</Button>
                    <Section>
                        <SectionHead>Import/Export projects and accounts</SectionHead>
                        <SizedBox height={24}/>
                        <Button type="action-blue" onClick={this.handleExportState}>Export</Button>
                        <SizedBox height={16}/>
                        <FileLoader onLoad={this.handleSetLoadedState}>Import</FileLoader>
                        <SizedBox height={32}/>
                    </Section>
                </Scrollbar>
            </Dialog>
        </>;
    }
}

export const SizedBox: React.FC<{width?: number, height?: number}> = ({width, height}) =>
    <div style={{width, height}}/>
