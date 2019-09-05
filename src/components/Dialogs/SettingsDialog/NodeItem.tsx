import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { INode, SettingsStore } from '@stores';

import Info from './Info';

import classNames from 'classnames';

import styles from './styles.less';


interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface INodeItemProps extends IInjectedProps {
    node: INode
    index: number
}

type TValidator = { urlError: string | null, isValidChain: boolean, isValid: boolean };

const titles: Record<string, 'Mainnet' | 'Testnet' | 'Stagenet' > = {
    'W': 'Mainnet',
    'T': 'Testnet',
    'S': 'Stagenet'
};

@inject('settingsStore')
@observer
export class NodeItem extends React.Component<INodeItemProps> {
    byteRef = React.createRef<HTMLInputElement>();

    handleDelete = (i: number) => {
        this.props.settingsStore!.deleteNode(i);
        this.switchToValidNode();
    };

    handleSetActive = (i: number) => this.props.settingsStore!.setDefaultNode(i);

    handleUpdateUrl = (value: string, i: number) => this.props.settingsStore!.updateNode(value, i, 'url');

    handleUpdateChainId = (value: string, i: number) => {
        this.validCheck({url: '', chainId: value}).isValidChain &&
        this.props.settingsStore!.updateNode(value, i, 'chainId');
    };

    handleKeyPress = () => this.byteRef.current!.setSelectionRange(0, this.byteRef.current!.value.length);

    switchToValidNode = () => {
        const {settingsStore} = this.props;
        const defaultNode = settingsStore!.activeNodeIndex;
        const nodes = settingsStore!.nodes;

        for (let i = defaultNode; i >= 0; i--) {
            if (this.validCheck(nodes[i]).isValid) {
                settingsStore!.setDefaultNode(i);
                break;
            }
        }
    };

    validCheck = (node?: INode): TValidator => {
        let out: TValidator = {urlError: null, isValidChain: false, isValid: false};
        if (!node) return out;
        try {
            const nodeUrl = new URL(node.url);
            const selfUrl =  new URL(window.location.href);
            if (selfUrl.protocol === 'https:' && nodeUrl.protocol !== 'https:') out.urlError = 'Only HTTPS is allowed';
        } catch (e) {
            out.urlError = 'Invalid URL'; //e.message;
        }
        const code = node.chainId.charCodeAt(0);
        if (code > 0 && code < 255 && !isNaN(code) && node.chainId.length === 1) {
            out.isValidChain = true;
        }
        out.isValid = out.urlError == null && out.isValidChain;
        return out;
    };

    private getNodeItemClass = (validator: TValidator) => {
        return classNames(
            styles.section_item,
            {[styles.section_item__invalid_URL]: validator.urlError},
            {[styles.section_item__invalid_byte]: !validator.isValidChain}
        );
    };


    render() {
        const {node, index: i } = this.props;
        const systemTitle = node.system ? titles[node.chainId] : '';
        const validator = this.validCheck(node);
        const className = this.getNodeItemClass(validator);
        const isActive = i === this.props.settingsStore!.activeNodeIndex;

        return <div className={className} key={i}>
            <div className={styles.section_item_title}>
                <div className={styles.label_url}>{systemTitle} URL</div>
                <div className={styles.label_byte}>Network byte</div>
            </div>
            <div className={styles.section_item_body}>
                {isActive
                    ? <div className={styles.on}/>
                    : <div
                        className={styles.off}
                        onClick={() => validator.isValid && this.handleSetActive(i)}
                    />}
                <input
                    disabled={node.system}
                    className={styles.inputUrl}
                    value={node.url}
                    onBlur={this.switchToValidNode}
                    onChange={(e) => this.handleUpdateUrl(e.target.value, i)}
                />
                <input
                    disabled={node.system}
                    className={styles.inputByte}
                    value={node.chainId}
                    ref={this.byteRef}
                    onChange={(e) => this.handleUpdateChainId(e.target.value, i)}
                    onKeyPress={this.handleKeyPress}
                />
                {systemTitle !== ''
                    ? <Info infoType={systemTitle}/>
                    : <div onClick={() => this.handleDelete(i)} className={styles.delete}/>
                }
                <div className={styles.section_item_warning}>
                    <div className={styles.label_url}>{validator.urlError}</div>
                    <div className={styles.label_byte}>Invalid byte</div>
                </div>
            </div>
        </div>;
    }
}

