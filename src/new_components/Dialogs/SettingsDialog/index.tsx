import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { observer, inject } from 'mobx-react';

import { SettingsStore } from '@stores';

import Dialog from '../../Dialog';
import { NodeItem } from './NodeItem';

import PerfectScrollbar from 'react-perfect-scrollbar';

import styles from './styles.less';
import Button from '@src/new_components/Button';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface ISettingsDialogProps extends RouteComponentProps, IInjectedProps {
}

@inject('settingsStore')
@observer
export default class SettingsDialog extends React.Component<ISettingsDialogProps> {
    handleClose = () => this.props.history.push('/');

    handleAdd = () => this.props.settingsStore!.addNode({url: '', chainId: 'T'});


    render() {
        return <Dialog
            title="Settings"
            footer={<Button type="action-blue" onClick={this.handleClose}>ok</Button>}
            onClose={this.handleClose}
            className={styles.root}
            width={618}
            visible
        >
            <PerfectScrollbar className={styles.scroll}>

                <div className={styles.section_head}>Default nodes</div>
                {this.props.settingsStore!.systemNodes.map((node, i) => (
                    <NodeItem key={i} node={node} index={i} title="Mainnet"/>
                ))}

                <div className={styles.section_head}>Custom nodes</div>
                {this.props.settingsStore!.customNodes.map((node, i) => (
                    <NodeItem key={i} node={node} index={i + 2} title="Testnet"/>
                ))}

                <Button className={styles.addNodeBtn} type="add-block" onClick={this.handleAdd}>Add node</Button>
            </PerfectScrollbar>

        </Dialog>;
    }
}
