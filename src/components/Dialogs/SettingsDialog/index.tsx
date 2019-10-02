import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { inject, observer } from 'mobx-react';
import { SettingsStore } from '@stores';
import Dialog from '../../Dialog';
import { NodeItem } from './NodeItem';
import Scrollbar from '@src/components/Scrollbar';
import styles from './styles.less';
import Button from '@src/components/Button';
import { logToTagManager } from '@utils/logToTagManager';
import Setting from '@components/Dialogs/SettingsDialog/Setting';
import Info from '@components/Dialogs/SettingsDialog/Info';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface ISettingsDialogProps extends RouteComponentProps, IInjectedProps {
}

const Section: React.FunctionComponent = (props) => <div className={styles.section}>{props.children}</div>;
const Row: React.FunctionComponent = (props) => <div className={styles.row}>{props.children}</div>;
const SectionHead: React.FunctionComponent = (props) => <div className={styles.section_head}>{props.children}</div>;

@inject('settingsStore')
@observer
export default class SettingsDialog extends React.Component<ISettingsDialogProps> {
    handleClose = () => this.props.history.push('/');

    handleAddNode = () => {
        this.props.settingsStore!.addNode({url: 'https://testnodes.wavesnodes.com', chainId: 'T'});
        logToTagManager({event: 'ideCustomNodeAdd'});
    };

    handleChangeAdditionalFee = (stringVal: string) => {
        let val = +stringVal;
        if (isNaN(val)) val = 0;
        const store = this.props.settingsStore!;
        store.defaultAdditionalFee = val;
    };

    handleChangeTimeout = (field: 'node' | 'test') => (strVal: string) => {
        let val = +strVal;
        if (isNaN(val)) val = 0;
        const store = this.props.settingsStore!;
        store.updateTimeout(val, field);
    };

    render() {
        const {defaultAdditionalFee, nodeTimeout, testTimeout} = this.props.settingsStore!;

        return <Dialog
            title="Settings"
            footer={<Button type="action-blue" className={styles.ok} onClick={this.handleClose}>Ok</Button>}
            onClose={this.handleClose}
            className={styles.root}
            width={618}
            visible
        >
            <Scrollbar className={styles.content}>
                <Row>
                    <Section>
                        <SectionHead>Default additional fee</SectionHead>
                        <Setting onChange={this.handleChangeAdditionalFee}
                                 value={defaultAdditionalFee.toString()}
                                 title="Amount in wavelets"
                                 info={<Info infoType="DefaultAdditionalFee"/>}
                        />
                    </Section>
                    {/*<Section>*/}
                    {/*    <SectionHead>Default additional fee</SectionHead>*/}
                    {/*    <Setting onChange={this.handleChangeAdditionalFee}*/}
                    {/*             value={defaultAdditionalFee.toString()}*/}
                    {/*             title="Amount in wavelets"*/}
                    {/*             info={<Info infoType="DefaultAdditionalFee"/>}*/}
                    {/*    />*/}
                    {/*</Section>*/}
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
                        <NodeItem key={i} node={node} index={i + 2}/>
                    ))}
                </Section>
                <Button className={styles.addNodeBtn} type="add-block" onClick={this.handleAddNode}>Add node</Button>
            </Scrollbar>
        </Dialog>;
    }
}
