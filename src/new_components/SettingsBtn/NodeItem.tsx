import * as React from 'react';
import styles from '../SettingsBtn/styles.less';
import Popover from 'rc-tooltip';
import { INode, SettingsStore } from '@stores';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface INodeItemProps extends IInjectedProps {
    node: INode
    index: number
    title?: string
}

type TValidator = { isValidUrl: boolean, isValidChain: boolean, isValid: boolean };

@inject('settingsStore')
@observer
export class NodeItem extends React.Component<INodeItemProps> {

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
    handleKeyPress = (e: any) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length);
    };

    switchToValidNode = () => {
        const {settingsStore} = this.props;
        const defaultNode = settingsStore!.defaultNodeIndex;
        const nodes = settingsStore!.nodes;
        for (let i = defaultNode; i >= 0; i--) {
            if (this.validCheck(nodes[i]).isValid) {
                settingsStore!.setDefaultNode(i);
                break;
            }
        }
    };

    info = <Popover placement="bottomLeft" trigger="hover" align={{offset: [-34, 0]}} overlay={
        <div>
            <div className={styles.tooltip_title}>Headline</div>
            <div className={styles.tooltip_text}>Once the transaction is confirmed, the gateway will
                process the transfer of BTC to a token in your Waves account.
            </div>
            <div className={styles.tooltip_more}>Show more</div>
        </div>
    }>
        <div className={styles.info}/>
    </Popover>;


    validCheck = (node?: INode): TValidator => {
        let out = {isValidUrl: false, isValidChain: false, isValid: false};
        if (!node) return out;
        try {
            new URL(node.url);
            out.isValidUrl = true;
        } catch (e) {
        }
        const code = node.chainId.charCodeAt(0);
        if (code > 0 && code < 255 && !isNaN(code) && node.chainId.length === 1) {
            out.isValidChain = true;
        }
        out.isValid = out.isValidUrl && out.isValidChain;
        return out;
    };

    getNodeItemClass = (validator: TValidator) => {
        let out = styles.section_item;
        if (!validator.isValidUrl) out = classNames(out, styles.section_item_invalid_URL);
        if (!validator.isValidChain) out = classNames(out, styles.section_item_invalid_byte);
        return out;
    };

    render() {
        const {node, index: i, title} = this.props;
        const validator = this.validCheck(node);
        const className = this.getNodeItemClass(validator);
        const isActive = i === this.props.settingsStore!.defaultNodeIndex;

        return <div className={className} key={i}>
            <div className={styles.section_item_title}>
                <div className={styles.label_url}>{title} URL</div>
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
                    onKeyPress={this.handleKeyPress}
                    onChange={(e) => this.handleUpdateChainId(e.target.value, i)}
                />
                {node.system ? this.info : <div onClick={() => this.handleDelete(i)} className={styles.delete}/>}
                <div className={styles.section_item_warning}>
                    <div className={styles.label_url}>Invalid URL</div>
                    <div className={styles.label_byte}>Invalid byte</div>
                </div>
            </div>
        </div>;
    }
}

