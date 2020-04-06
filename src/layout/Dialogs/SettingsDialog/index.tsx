import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { inject, observer } from 'mobx-react';
import { IAccount, SettingsStore, TFile } from '@stores';
import Dialog from '@components/Dialog';
import { NodeItem } from './NodeItem';
import Scrollbar from '@src/components/Scrollbar';
import styles from './styles.less';
import Button from '@src/components/Button';
import { logToTagManager } from '@utils/logToTagManager';
import Setting from './Setting';
import Info from './Info';
import { NETWORKS } from '@src/constants';
import FileLoader from '@src/layout/Dialogs/SettingsDialog/FileLoader';
import { data } from '@waves/waves-transactions';
import { getFileIcon } from '@src/layout/SidePanel/Explorer';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface IProps extends RouteComponentProps, IInjectedProps {
}

interface IState {
    data?: any
}

const Section: React.FunctionComponent = (props) => <div className={styles.section}>{props.children}</div>;
const Row: React.FunctionComponent = (props) => <div className={styles.row}>{props.children}</div>;
const SectionHead: React.FunctionComponent = (props) => <div className={styles.section_head}>{props.children}</div>;

@inject('settingsStore')
@observer
export default class SettingsDialog extends React.Component<IProps, IState> {

    state: IState = {};

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


    handleSetLoadedState = (data: any) => {
        console.log(data);
        this.setState({data});
    };

    handleLoadState = async () => {
        const data = this.state.data;
        await this.props.settingsStore!.loadState(data);
        this.setState({data: undefined});
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
                    {this.state.data
                        ? <div>
                            {this.state.data.files && <Section>
                                <SectionHead>Files</SectionHead><br/>

                                {this.state.data.files.map((file: TFile) =>
                                    <div key={file.id} className={styles.itemsSelector_item}>{file.name}</div>)}
                            </Section>}
                            {this.state.data.accounts && this.state.data.accounts.accountGroups && <>
                                {
                                    Object.entries(this.state.data.accounts.accountGroups)
                                        .map(([chainId, {accounts}]: [string, any]) => {
                                            console.log(chainId, accounts);
                                            return accounts.length > 0 && <Section key={chainId}>
                                                <SectionHead key={chainId}>Accounts {chainId}</SectionHead>
                                                {accounts.map((acc: any, i: number) =>
                                                    <div key={i} className={styles.itemsSelector_item}>{acc.label}</div>)}
                                            </Section>;
                                        })
                                }
                            </>}
                        </div>
                        : <>
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
                                <br/>
                                <Button type="action-blue" onClick={this.handleExportState}>Export</Button>
                                <br/>
                                <FileLoader onLoad={this.handleSetLoadedState}>Import</FileLoader>
                                <br/>
                                <br/>
                            </Section>
                        </>}
                </Scrollbar>
            </Dialog>
        </>;
    }
}
