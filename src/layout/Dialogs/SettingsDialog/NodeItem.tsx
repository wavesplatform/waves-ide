import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';

import { Node, SettingsStore } from '@stores';

import Info from './Info';

import classNames from 'classnames';

import styles from './styles.less';
import { logToTagManager } from '@utils/logToTagManager';
import Input from '@components/Input';
import Checkbox from '@components/Checkbox';
import { activeHosts, formatHost } from '@utils/hosts';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface INodeItemProps extends IInjectedProps {
    node: Node
    index: number
}

const titles: Record<string, 'Mainnet' | 'Testnet' | 'Stagenet'> = {
    'W': 'Mainnet',
    'T': 'Testnet',
    'S': 'Stagenet'
};

@inject('settingsStore')
@observer
export class NodeItem extends React.Component<INodeItemProps> {
    @computed
    get urlValidation() {
        const { node } = this.props;

        const selfUrl = new URL(window.location.href);

        return ([
            {
                isValid: node.isValidUrlFormat,
                message: 'Invalid url format'
            },
            {
                isValid: node.isSecure,
                message: (
                    <div>
                        <a href={selfUrl.origin} target="_blank">
                            {formatHost(selfUrl.origin)}
                        </a>
                        &nbsp;
                        supports only the HTTPS protocol. To setup node with the HTTP protocol, use 
                        &nbsp;
                        <a href={activeHosts.stagenet.insecure} target="_blank">
                            {formatHost(activeHosts.stagenet.insecure)}
                        </a>
                        .
                    </div>
                )
            },
            {
                isValid: node.isValidNodeUrl,
                message: 'Invalid node url'
            },
        ].find(check => !check.isValid));
    }

    @computed
    get chainIdValidation() {
        const { node } = this.props;

        return ([
            {
                isValid: node.isValidChainId,
                message: 'Invalid byte'
            }
        ].find(check => !check.isValid));
    }

    byteRef = React.createRef<HTMLInputElement>();

    handleDelete = (i: number) => {
        this.props.settingsStore!.deleteNode(i);
        this.switchToValidNode();
    };

    handleSetActive = (i: number) => this.props.settingsStore!.setDefaultNode(i);

    handleUpdateUrl = (value: string, i: number) => this.props.settingsStore!.updateNode(value, i, 'url');

    handleUpdateChainId = (value: string, i: number) => {
        this.props.settingsStore!.updateNode(value, i, 'chainId');
        logToTagManager({event: 'ideChainIdChange', ideChainId: value});
    };

    handleKeyPress = () => this.byteRef.current!.setSelectionRange(0, this.byteRef.current!.value.length);

    switchToValidNode = () => {
        const {settingsStore} = this.props;
        const defaultNode = settingsStore!.activeNodeIndex;
        const nodes = settingsStore!.nodes;

        for (let i = defaultNode; i >= 0; i--) {
            if (nodes[i].isValid) {
                settingsStore!.setDefaultNode(i);
                break;
            }
        }
    };

    private getNodeItemClass = () => {
        const { node } = this.props;

        return classNames(
            styles.section_item,
            {[styles.section_item__invalid_URL]: !node.isValid},
            {[styles.section_item__invalid_byte]: !node.isValidChainId}
        );
    };

    onSelect = (isValid: boolean, i: number) => () => isValid && this.handleSetActive(i);

    render() {
        const {node, index: i} = this.props;
        const systemTitle = node.system ? titles[node.chainId] : '';
        const className = this.getNodeItemClass();
        const isActive = i === this.props.settingsStore!.activeNodeIndex;

        return <div className={className} key={i}>
            <div className={styles.section_item_title}>
                <div className={styles.label_url}>{systemTitle} URL</div>
                <div className={styles.label_byte}>Network byte</div>
            </div>
            <div className={styles.section_item_body}>
                <Checkbox className={styles.checkBox} onSelect={this.onSelect(node.isValid, i)} selected={isActive}/>
                <Input
                    disabled={node.system}
                    className={styles.inputUrl}
                    value={node.url}
                    onBlur={this.switchToValidNode}
                    onChange={(e) => this.handleUpdateUrl(e.target.value, i)}
                />
                <Input
                    disabled
                    className={styles.inputByte}
                    value={node.chainId}
                    inputRef={this.byteRef}
                    onBlur={this.switchToValidNode}
                    onChange={(e) => this.handleUpdateChainId(e.target.value, i)}
                    onKeyPress={this.handleKeyPress}
                />
                
                {systemTitle !== ''
                    ? <Info infoType={systemTitle}/>
                    : <div onClick={() => this.handleDelete(i)} className={styles.delete}/>
                }

                <div className={styles.section_item_warning}>
                    <div className={styles.label_url}>
                        {this.urlValidation && (
                            <div>{this.urlValidation.message}</div>
                        )}
                    </div>

                    <div className={styles.label_byte}>
                        {this.chainIdValidation && (
                            <div>{this.chainIdValidation.message}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>;
    }
}

