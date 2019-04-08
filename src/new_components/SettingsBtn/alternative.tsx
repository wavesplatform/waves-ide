import * as React from 'react';
import Dialog from '../Dialog';
import styles from './styles.less';
import { NodeItem } from './NodeItem';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { SettingsStore } from '@stores';
import { observer, inject } from 'mobx-react';

interface IInjectedProps {
    settingsStore?: SettingsStore
}

interface ISettingsBtnProps extends IInjectedProps {
}

@inject('settingsStore')
@observer
export default class SettingsBtn extends React.Component<ISettingsBtnProps> {

    state = {
        visible: false
    };

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
        return <div className={styles['settings-btn']}>
            <div onClick={() => this.setState({visible: true})} className={'settings-24-basic-600'}/>
            <Dialog
                title="Settings"
                footer={<button className={styles.okBtn} onClick={() => this.setState({visible: false})}>ok</button>}
                onClose={() => this.setState({visible: false})}
                className={styles.root}
                width={618}
                visible={this.state.visible}
            >
                <PerfectScrollbar className={styles.scroll}>
                    {this.getNodes()}
                    <button className={styles.addNodeBtn} onClick={this.handleAdd}>Add node</button>
                </PerfectScrollbar>

            </Dialog>
        </div>;
    }
}

