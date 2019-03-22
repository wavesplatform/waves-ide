import React from 'react';
import './style.css';
import { StyledComponentProps } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from 'rc-button';
import ScriptComplexity from '@src/new_components/editorsFooter/scriptComplexity';

interface IFooterContainerProps extends StyledComponentProps<keyof ReturnType<typeof styles>> {
    scriptSize?: number
    nodeUrl?: string
    base64?: string
    copyBase64Handler?: () => void
    issueHandler?: () => void
    deployHandler?: () => void
}

const styles = () => ({
    root: {
        backgroundColor: 'rgb(248,249,251)',
        left: '0',
        bottom: '0',
        width: '100%',
        height: '40px',
        overflow: 'hidden',
        fontSize: '13px',
        color: 'rgb(128, 144, 163)'
    },
    Container: {
        margin: '0 15px'
    },
    boldText: {
        fontWeight: 'bold',
        marginRight: '30px'
    },
});

class FooterContainer extends React.Component<IFooterContainerProps> {

    constructor(props: IFooterContainerProps) {
        super(props);
    }

    render() {
        const {classes, scriptSize, nodeUrl, base64, copyBase64Handler, deployHandler, issueHandler} = this.props;

        return (
            <footer className={classes!.root}>

                <div style={{float: 'left', margin: '10px 15px'}}>
                    <span>Script size: </span>
                    <span className={classes!.boldText}> {scriptSize || 0} bytes</span>
                    <span>Script complexity: </span><span className={classes!.boldText}>
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

export default withStyles(styles as any)(FooterContainer);
