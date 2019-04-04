import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Dialog from 'rc-dialog';
import styles from './styles.less';
import Popover from 'rc-tooltip';

import { INode, SettingsStore } from '@stores';
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

    getRadio = (i: number, disabled?: boolean) =>
        <input
            type="radio"
            name="radio"
            checked={this.props.settingsStore!.defaultNodeIndex === i}
            disabled={disabled}
            onChange={() => this.props.settingsStore!.defaultNodeIndex = i}
        />;

    createNodesItem = (node: INode, i: number, title?: string) =>
        <div key={i} className={styles.inputGroup}>
            {this.getRadio(i, node.url === '' || node.chainId === '')}
            <label>
                {title} URL<br/>
                <input
                    type="text"
                    value={node.url}
                    readOnly={node.system}
                    onChange={(e) => this.props.settingsStore!.updateNode(e.target.value, i, 'url')}
                />
            </label>
            <label>
                Network byte<br/>
                <input
                    type="text"
                    value={node.chainId}
                    readOnly={node.system}
                    onChange={(e) => this.props.settingsStore!.updateNode(e.target.value, i, 'chainId')}
                />
            </label>
            {node.system ?
                <Popover placement="bottom" overlay={<p>info</p>} trigger="hover">
                    <div className="systemdoc-16-basic-600"/>
                </Popover>
                : <div onClick={() => this.props.settingsStore!.deleteNode(i)} className="delete-16-basic-600"/>
            }
        </div>;

    getNodeTitle = (id: string) => {
        let title = '';
        if (id === 'W') title = 'Mainnet';
        if (id === 'T') title = 'Testnet';
        return title;
    };

    getNodes = () => {
        let defaultNodes: JSX.Element[] = [], customNodes: JSX.Element[] = [];

        this.props.settingsStore!.nodes.map((node, i) => {
            if (node.system) defaultNodes.push(this.createNodesItem(node, i, this.getNodeTitle(node.chainId)));
            else customNodes.push(this.createNodesItem(node, i));
        });

        return <>
            <div>Default nodes</div>
            <div className={styles.nodesContainer}>{defaultNodes}</div>
            <div>Custom nodes</div>
            <div className={styles.nodesContainer}>{customNodes}</div>
        </>;
    };

    render() {
        const {settingsStore} = this.props;
        return <Dialog
            title="Settings"
            className={styles.root}
            footer={<button onClick={this.handleClose}>ok</button>}
            visible
            onClose={this.handleClose}
        >
            {this.getNodes()}
            <button onClick={() => settingsStore!.addNode({url: '', chainId: ''})}>Add node</button>

        </Dialog>;
    }
}

