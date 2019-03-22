import React from 'react';
import './style.css';
import { Button } from 'antd';
import ScriptComplexity from '@src/new_components/MainPanelFooter/ScriptComplexity';

import styles from './styles';

interface IContractFooterProps {
    scriptSize?: number
    nodeUrl?: string
    base64?: string
    copyBase64Handler?: () => void
    issueHandler?: () => void
    deployHandler?: () => void
}

class ContractFooter extends React.Component<IContractFooterProps> {
    render() {
        const {
            scriptSize,
            nodeUrl,
            base64,
            copyBase64Handler,
            deployHandler,
            issueHandler
        } = this.props;

        return (
            <footer>
                <div style={{float: 'left', margin: '10px 15px'}}>
                    <span>Script size: </span>
                    <span className={styles!.boldText}> {scriptSize || 0} bytes</span>
                    <span>Script complexity: </span><span className={styles!.boldText}>
                        {nodeUrl && base64 ? <ScriptComplexity nodeUrl={nodeUrl} base64={base64}/> : 0} / 2000
                    </span>
                </div>

                <div style={{float: 'right', marginTop: '4px'}}>
                    <Button htmlType="button" disabled={!copyBase64Handler} onClick={copyBase64Handler}>
                        Copy BASE64
                    </Button>
                    <Button htmlType="button" type="primary" disabled={!issueHandler} onClick={issueHandler}>
                        Issue token
                    </Button>
                    <Button htmlType="button" type="primary" disabled={!deployHandler} onClick={deployHandler}>
                        Deploy accountscript
                    </Button>

                </div>
            </footer>
        );
    }
}

export default ContractFooter;
