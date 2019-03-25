import React from 'react';
import ScriptComplexity from './ScriptComplexity';
import styles from '../styles.less';

interface IContractFooterProps {
    scriptSize?: number
    nodeUrl?: string
    base64?: string
    copyBase64Handler?: () => void
    issueHandler?: () => void
    deployHandler?: () => void
    className: string
}

class ContractFooter extends React.Component<IContractFooterProps> {
    render() {
        const {
            scriptSize,
            nodeUrl,
            base64,
            copyBase64Handler,
            deployHandler,
            issueHandler,
            className
        } = this.props;

        return <footer className={className}>
            <ScriptComplexity nodeUrl={nodeUrl} base64={base64} scriptSize={scriptSize}/>

            <div className={styles.right}>
                <button className={styles.btn} disabled={!copyBase64Handler} onClick={copyBase64Handler}>
                    Copy BASE64
                </button>
                <button className={styles['btn-primary']} disabled={!issueHandler} onClick={issueHandler}>
                    Issue token
                </button>
                <button className={styles['btn-primary']} disabled={!deployHandler} onClick={deployHandler}>
                    Deploy accountscript
                </button>
            </div>
        </footer>;
    }
}

export default ContractFooter;
