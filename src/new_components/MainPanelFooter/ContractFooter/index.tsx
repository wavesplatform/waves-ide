import React from 'react';
// import Button from 'rc-button';
import ScriptComplexity from './ScriptComplexity';

interface IContractFooterProps {
    scriptSize?: number
    nodeUrl: string
    base64: string
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
                <ScriptComplexity nodeUrl={nodeUrl} base64={base64} scriptSize={scriptSize}/>

                <div style={{float: 'right', marginTop: '4px'}}>
                    <button>Copy BASE64</button>
                    <button>Issue token</button>
                    <button>Deploy accountscript</button>
                    {/*<Button htmlType="button" disabled={!copyBase64Handler} onClick={copyBase64Handler}>*/}
                        {/*Copy BASE64*/}
                    {/*</Button>*/}
                    {/*<Button htmlType="button" type="primary" disabled={!issueHandler} onClick={issueHandler}>*/}
                        {/*Issue token*/}
                    {/*</Button>*/}
                    {/*<Button htmlType="button" type="primary" disabled={!deployHandler} onClick={deployHandler}>*/}
                        {/*Deploy accountscript*/}
                    {/*</Button>*/}

                </div>
            </footer>
        );
    }
}

export default ContractFooter;
