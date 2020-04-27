import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { inject, observer } from 'mobx-react';
import { FILE_TYPE, IAccount, INode, SettingsStore } from '@stores';
import Dialog from '@components/Dialog';
import Scrollbar from '@src/components/Scrollbar';
import styles from './styles.less';
import Button from '@src/components/Button';
import Tree, { TreeNode } from 'rc-tree';
import { libs } from '@waves/waves-transactions';
import { IImportedData } from '@stores/SettingsStore';

const {address} = libs.crypto;

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface IProps extends RouteComponentProps, IInjectedProps {
}

interface IState {
    files: string[],
    accounts: string[],
    data: IImportedData
}


@inject('settingsStore')
@observer
export default class ImportStateDialog extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        const data = props.settingsStore!.importStorageData;
        if (!data) {
            this.handleClose();
            return;
        }
        this.state = {
            data,
            files: data.files.map(({id}) => id),
            accounts: Object.values(data.accounts.accountGroups)
                .reduce(((acc, {accounts}) => [...acc, ...accounts.map(v => JSON.stringify(v))]), [])
        };
    }

    handleCheck = (key: 'files' | 'accounts') => (checkedKeys: string[]) =>
        this.setState({
            [key]: checkedKeys
                .filter(v =>
                    !(['files', 'ride', 'js', 'accounts', 'default', 'custom'].includes(v) ||
                        (v.substr(0, 7) === 'network')))
        } as any);


    handleImport = async () => {
        const {data} = this.state;
        const files = data.files.filter(({id}) => this.state.files.includes(id));
        const accounts = this.state.accounts.map(acc => JSON.parse(acc) as IAccount);
        const customChainIds = accounts.map(({chainId}) => chainId);
        const customNodes = data.customNodes.filter(({chainId}) => customChainIds.includes(chainId));
        await this.props.settingsStore!.loadState(files, accounts, customNodes);
        this.handleClose()
    };

    handleClose = () => {
        this.props.history.push('/');
        this.props.settingsStore!.importStorageData = null;
    };


    getAccountsList = (nodes: INode[]): (typeof TreeNode)[] =>
        nodes.map(({url, chainId}, i) => {
            const {accountGroups} = this.state.data.accounts;
            const accounts = accountGroups && accountGroups[chainId] && accountGroups[chainId].accounts;
            return accounts && accounts.length > 0
                ? <TreeNode key={'network' + i} title={url} {...folderProps}>{
                    accounts.map((acc) =>
                        <TreeNode icon={<FileIcn/>} key={JSON.stringify(acc)} title={address(acc.seed, acc.chainId)}/>)}
                </TreeNode>
                : null;
        }).filter(v => v != null);

    render() {
        const {data} = this.state;
        const {files, customNodes} = data;
        const systemAccountsList = this.getAccountsList(this.props.settingsStore!.systemNodes);
        const customAccountsList = this.getAccountsList(customNodes);

        return <>
            <Dialog
                title="Import"
                footer={<Button type="action-blue" className={styles.ok} onClick={this.handleImport}>Import</Button>}
                onClose={this.handleClose}
                className={styles.root}
                width={618}
                visible
            >
                <div className={styles.importTreeRoot}>
                    <Scrollbar className={styles.content}>
                        <Tree
                            selectable={false}
                            defaultCheckedKeys={['files']}
                            onCheck={this.handleCheck('files')}
                            defaultExpandAll
                            checkable
                        >
                            <TreeNode key="files" title="Files" {...folderProps}>
                                <TreeNode key="ride" title="Ride files" {...folderProps}>
                                    {files.filter(({type}) => type === FILE_TYPE.RIDE)
                                        .map(({id, name}) => <TreeNode icon={<FileIcn/>} key={id} title={name}/>)}
                                </TreeNode>

                                <Tree key="js" title="Test files" {...folderProps}>
                                    {files.filter(({type}) => type === FILE_TYPE.JAVA_SCRIPT)
                                        .map(({id, name}) => <TreeNode icon={<FileIcn/>} key={id} title={name}/>)}
                                </Tree>
                            </TreeNode>
                        </Tree>

                        <Tree
                            selectable={false}
                            defaultCheckedKeys={['accounts']}
                            onCheck={this.handleCheck('accounts')}
                            defaultExpandAll
                            checkable
                        >
                            <TreeNode key="accounts" title="Accounts" {...folderProps}>
                                {systemAccountsList.length > 0 &&
                                <TreeNode key="default" title="Default nodes" {...folderProps}>
                                    {systemAccountsList}
                                </TreeNode>}

                                {customAccountsList.length > 0 &&
                                <TreeNode key="custom" title="Custom nodes" {...folderProps}>
                                    {customAccountsList}
                                </TreeNode>}
                            </TreeNode>
                        </Tree>
                    </Scrollbar>
                </div>
            </Dialog>
        </>;
    }
}


const getSvgIcon = (iStyle = {}, style = {}) => (
    <i style={iStyle}>
        <svg style={style} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <g fill="none" fillRule="evenodd">
                <path fill="#FFF" fillOpacity="0" d="M0 0h12v12H0z"/>
                <path fill="#4E5C6E"
                      d="M5.307 8.334L1.621 4.79a.828.828 0 0 1 0-1.194.896.896 0 0 1 1.241 0L6 6.613l3.138-3.016a.896.896 0 0 1 1.241 0 .828.828 0 0 1 0 1.194L6.693 8.334a1 1 0 0 1-1.386 0z"/>
            </g>
        </svg>

    </i>
);

const switcherIcon = (obj: any) => {
    if (obj.isLeaf) {
        return getSvgIcon(
            {cursor: 'pointer', backgroundColor: 'transparent'},
            {transform: 'rotate(270deg)'},
        );
    }
    return getSvgIcon(
        {cursor: 'pointer', backgroundColor: 'transparent'},
        {transform: `rotate(${obj.expanded ? -90 : 0}deg)`},
    );
};


const FolderIcn: React.FunctionComponent = () => <div className={styles.folderIcn}/>;
const FileIcn: React.FunctionComponent = () => <div className={styles.fileIcn}/>;
const folderProps = {
    switcherIcon: switcherIcon,
    icon: <FolderIcn/>,
    isLeaf: false
};

