import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { computed } from 'mobx';

import { Node, NodeParams, SettingsStore } from '@stores';

import Info from './Info';

import classNames from 'classnames';

import styles from './styles.less';
import { logToTagManager } from '@utils/logToTagManager';
import Input from '@components/Input';
import Checkbox from '@components/Checkbox';
import { getNetworkByte } from '@utils'
import { validateNodeUrl } from '@utils/validators'

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface INodeItemProps extends IInjectedProps {
    node: Node
    index: number
}

interface IState {
    out: TValidator
}

type TValidator = { 
    urlError: string | null,
    nodeUrlError: string | null,
    chainIdError: string | null
    // isValidChain: boolean,
    // isValid: boolean
};

const titles: Record<string, 'Mainnet' | 'Testnet' | 'Stagenet'> = {
    'W': 'Mainnet',
    'T': 'Testnet',
    'S': 'Stagenet'
};

@inject('settingsStore')
@observer
export class NodeItem extends React.Component<INodeItemProps, IState> {
    state: IState = {
        out: {
            urlError: null,
            nodeUrlError: null,
            chainIdError: null,
            // isValidChain: false,
            // isValid: false
        }
    }

    @computed
    get errors(): TValidator {
        const { node } = this.props

        const selfUrl = new URL(window.location.href);
        

        return {
            // urlError: !node.isValidUrl ? 'Wrong url format' : null,
            urlError: (selfUrl.protocol === 'https' && !node.isSecure) ? 'Only HTTPS is allowed': null,
            chainIdError: (node.isValidChainId !== undefined && node.isValidChainId === false) ? 'Invalid byte' : null,
            nodeUrlError: (node.isValidNodeUrl !== undefined && node.isValidNodeUrl === false) ? 'Invalid node url' : null
        }
    }

    byteRef = React.createRef<HTMLInputElement>();

    handleDelete = (i: number) => {
        this.props.settingsStore!.deleteNode(i);
        this.switchToValidNode();
    };

    handleSetActive = (i: number) => this.props.settingsStore!.setDefaultNode(i);

    handleUpdateUrl = (value: string, i: number) => this.props.settingsStore!.updateNode(value, i, 'url');

    handleUpdateChainId = (value: string, i: number) => {
        const { node } = this.props;
        
        // if (this.validCheck({url: '', chainId: value}).isValidChain) {
            this.props.settingsStore!.updateNode(value, i, 'chainId');
            logToTagManager({event: 'ideChainIdChange', ideChainId: value});
        // }
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

    asyncCheck = async () => {

    }

    validCheck = (node?: Node) => {
        let out = this.state.out

        // let out: TValidator = {urlError: null, isValidChain: false, isValid: false};
        if (!node) return out;
        
        try {
            if (!node.isValidUrl) {
                this.setState({
                    out: {
                        ...out,
                        urlError: 'Wrong url format'
                    }
                })
            };

            const selfUrl = new URL(window.location.href);

            // if (selfUrl.protocol === 'https:' && nodeUrl.protocol !== 'https:') {
            if (selfUrl.protocol === 'https' && !node.isSecure) {
                this.setState({
                    out: {
                        ...out,
                        urlError: 'Only HTTPS is allowed'
                    }
                })
            };

            if (!node.isValidChainId) {
                this.setState({
                    out: {
                        ...out,
                        chainIdError: 'Invalid byte'
                    }
                })
            };

            if (!node.isValidNodeUrl) {
                this.setState({
                    out: {
                        ...out,
                        nodeUrlError: 'Invalid node url'
                    }
                })
            };

        } catch (e) {

        }

        // const code = node.chainId.charCodeAt(0);
        
        // if (code > 0 && code < 255 && !isNaN(code) && node.chainId.length === 1) {
        //     out.isValidChain = true;
        // }
        
        // out.isValid = out.urlError == null && out.isValidChain;
        // return out;
    };

    private getNodeItemClass = () => {
        const { node } = this.props

        return classNames(
            styles.section_item,
            {[styles.section_item__invalid_URL]: !node.isValidNodeUrl},
            {[styles.section_item__invalid_byte]: !node.isValidChainId}
        );
    };

    onSelect = (isValid: boolean, i: number) => () => isValid && this.handleSetActive(i);

    componentDidUpdate() {
        console.log('componentDidUpdate', this.props.node)
    }

    componentDidMount() {
        console.log('componentDidMount', this.props.node)
    }

    render() {
        const {node, index: i} = this.props;
        const errors = this.errors;
        const systemTitle = node.system ? titles[node.chainId] : '';
        const className = this.getNodeItemClass();
        const isActive = i === this.props.settingsStore!.activeNodeIndex;

        console.log('errors', errors)

        return <div className={className} key={i}>
            <div className={styles.section_item_title}>
                <div className={styles.label_url}>{systemTitle} URL</div>
                <div className={styles.label_byte}>Network byte</div>
            </div>
            <div className={styles.section_item_body}>
                <Checkbox className={styles.checkBox} onSelect={this.onSelect(!!node.isValid, i)} selected={isActive}/>
                <Input
                    disabled={node.system}
                    className={styles.inputUrl}
                    value={node.url}
                    onBlur={this.switchToValidNode}
                    onChange={(e) => this.handleUpdateUrl(e.target.value, i)}
                />
                <Input
                    disabled={node.system}
                    className={styles.inputByte}
                    value={node.chainId}
                    inputRef={this.byteRef}
                    onChange={(e) => this.handleUpdateChainId(e.target.value, i)}
                    onKeyPress={this.handleKeyPress}
                />
                {systemTitle !== ''
                    ? <Info infoType={systemTitle}/>
                    : <div onClick={() => this.handleDelete(i)} className={styles.delete}/>
                }
                <div className={styles.section_item_warning}>
                    <div className={styles.label_url}>{this.errors.nodeUrlError}</div>
                    <div className={styles.label_byte}>{this.errors.chainIdError}</div>
                </div>
            </div>
        </div>;
    }
}

