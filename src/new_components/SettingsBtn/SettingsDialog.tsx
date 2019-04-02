import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Dialog from 'rc-dialog';
import styles from './styles.less';
import Popover from 'rc-tooltip';

import { SettingsStore } from '@stores';
import { observer, inject } from 'mobx-react';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface ISettingsDialogProps extends RouteComponentProps, IInjectedProps {

}

type TNode = { url: string, byte: string };

@inject('settingsStore')
@observer
export class SettingsDialog extends React.Component<ISettingsDialogProps> {

    state: {
        nodes: TNode[]
        activeNode: string
    } = {
        nodes: [],
        activeNode: 'W'
    };

    handleClose = () => this.props.history.push('/');

    addNode = () => {
        let nodes = this.state.nodes;
        this.setState({nodes: [...nodes, {url: '', byte: ''}]});
    };

    getRadio = (key: string, disabled?: boolean) => <input
        type="radio"
        name="radio"
        checked={this.state.activeNode === key}
        disabled={disabled}
        onChange={() => this.setState({activeNode: key})}
    />;

    changeHandler = (e: React.ChangeEvent<HTMLInputElement>, i: number, field: 'url' | 'byte') => {
        let nodes = this.state.nodes;
        nodes[i][field] = e.target.value;
        this.setState({nodes: nodes});
    };

    removeHandler = (i: number) => {
        let nodes = this.state.nodes;
        nodes.splice(i, 1);
        this.setState({nodes: nodes});
    };

    render() {
        const {settingsStore} = this.props;
        // Todo: store supports multiple nodes. We work only with default for now
        const node = settingsStore!.defaultNode!;


        return (
            <Dialog
                title="Settings"
                className={styles.root}
                footer={<>
                    <button onClick={this.handleClose}>Cancel</button>
                    <button onClick={this.handleClose}>Save</button>
                </>}
                visible
                onClose={this.handleClose}
            >
                <div>Default nodes</div>
                <div className={styles.inputGroup}>
                    {this.getRadio('W')}
                    <label>
                        Mainnet URL<br/>
                        <input type="text" value={'https://mainnodes.wavesplatform.com/'} readOnly={true}/>
                    </label>
                    <label>Network byte<br/><input type="text" value="W" readOnly={true}/></label>
                    <Popover placement="bottom" overlay={<p>info</p>} trigger="hover">
                        <div className="systemdoc-16-basic-600"/>
                    </Popover></div>
                <div className={styles.inputGroup}>
                    {this.getRadio('T')}
                    <label>
                        Testnet URL<br/>
                        <input type="text" value={'https://testnodes.wavesplatform.com/'} readOnly={true}/>
                    </label>
                    <label>Network byte<br/><input type="text" value="T" readOnly={true}/></label>
                    <Popover placement="bottom" overlay={<p>info</p>} trigger="hover">
                        <div className="systemdoc-16-basic-600"/>
                    </Popover>
                </div>
                <div>Custom nodes</div>
                <div className={styles.nodesContainer}>
                    {this.state.nodes.map((data: TNode, i: number) =>
                        <div key={i} className={styles.inputGroup}>
                            {this.getRadio(data.byte, data.url === '' || data.byte === '')}
                            <label>
                                URL<br/>
                                <input type="text" value={data.url}
                                       onChange={(e) => this.changeHandler(e, i, 'url')}/>
                            </label>
                            <label>
                                Network byte<br/>
                                <input type="text" value={data.byte}
                                       onChange={(e) => this.changeHandler(e, i, 'byte')}
                                />
                            </label>
                            <div onClick={() => this.removeHandler(i)} className="delete-16-basic-600"/>
                        </div>)
                    }
                </div>

                <button onClick={this.addNode}>Add node</button>
                {/*<div style={{display: 'flex', flexDirection: 'row'}}>*/}
                {/*<div style={{flex: 2}}>*/}
                {/*<TextField*/}
                {/*label="Node URL"*/}
                {/*value={node.url}*/}
                {/*fullWidth={true}*/}
                {/*onChange={(e) => {*/}
                {/*node.url = e.target.value;*/}
                {/*}}*/}
                {/*/><br/>*/}
                {/*<TextField*/}
                {/*label="Network Byte"*/}
                {/*value={node.chainId}*/}
                {/*onChange={(e) => {*/}
                {/*node.chainId = e.target.value;*/}
                {/*}}*/}
                {/*/>*/}
                {/*</div>*/}
                {/*<i style={{paddingTop: '27px'}} className="material-icons">info</i>*/}
                {/*<div style={{padding: '15px', flex: 1}}>*/}
                {/*Here you can set environment variables.*/}
                {/*<ul>*/}
                {/*<li><b>Node URL: </b>Node address</li>*/}
                {/*<li><b>Network byte: </b>'T' for testnet 'W' for mainnet</li>*/}
                {/*</ul>*/}
                {/*Console functions use them as default*/}
                {/*</div>*/}
                {/*</div>*/}
            </Dialog>
        );
    }
}

