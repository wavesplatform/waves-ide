import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Dialog from 'rc-dialog';
import styles from '../SettingsBtn/styles.less';
import { NodeItem } from '../SettingsBtn/NodeItem';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { SettingsStore } from '@stores';
import { observer, inject } from 'mobx-react';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface ISettingsDialogProps extends RouteComponentProps, IInjectedProps {
}

@inject('settingsStore')
@observer
export class SettingsDialog extends React.Component<ISettingsDialogProps> {

    handleClose = () => this.props.history.push('/');
    handleAdd = () => this.props.settingsStore!.addNode({url: '', chainId: 'T'});
    getNodes = () => {
        let defaultNodes: JSX.Element[] = [], customNodes: JSX.Element[] = [];

        this.props.settingsStore!.nodes.forEach((node, i) => {
            if (node.system) {
                defaultNodes.push(
                    <NodeItem key={i} node={node} index={i} title={node.chainId === 'W' ? 'Mainnet' : 'Testnet'}/>
                );
            } else customNodes.push(<NodeItem key={i} node={node} index={i}/>);
        });

        return <>
            <div className={styles.section_head}>Default nodes</div>
            {defaultNodes}
            <div className={styles.section_head}>Custom nodes</div>
            {customNodes}
        </>;
    };

    render() {
        return <Dialog
            title="Settings"
            footer={<button className={styles.okBtn} onClick={this.handleClose}>ok</button>}
            onClose={this.handleClose}
            className={styles.root}
            width={618}
            visible
        >
            <PerfectScrollbar className={styles.scroll}>
                {this.getNodes()}
                <button className={styles.addNodeBtn} onClick={this.handleAdd}>Add node</button>
            </PerfectScrollbar>

        </Dialog>;
    }
}

