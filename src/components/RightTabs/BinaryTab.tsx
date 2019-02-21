import * as React from 'react'
import {connect, Dispatch} from 'react-redux'
import Button from '@material-ui/core/Button';
import {copyToClipboard} from '../../utils/copyToClipboard'
import {userNotification} from '../../store/notifications/actions'
import {RootAction, RootState} from "../../store";
import {StyledComponentProps, Theme} from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import * as RideJS from '@waves/ride-js'
import {FILE_TYPE, IFile} from "../../store/files/reducer";
import {issue, setAssetScript, setScript} from "@waves/waves-transactions";
import {txGenerated} from "../../store/txEditor/actions";
import {RouteComponentProps, withRouter} from "react-router";
import {getCurrentFile} from "../../store/file-manager-mw";
import ScriptInfo from "./ScriptInfo";

const styles = (theme: Theme) => ({
    root: {
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '15px',

    },
    base64: {
        wordWrap: 'break-word',
        fontSize: '10px',
        color: 'lightgrey',
    }
});


const mapStateToProps = (state: RootState) => ({
    file: getCurrentFile(state),
    chainId: state.settings.chainId
})
const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    onCopy: () => {
        dispatch(userNotification("Copied!"))
    },
    onTxGenerated: (tx: string) => dispatch(txGenerated(tx))
})

interface IBinaryTabProps extends StyledComponentProps<keyof ReturnType<typeof styles>>,
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {

}

class BinaryTab extends React.Component<IBinaryTabProps> {

    handleDeploy = (base64: string, file: IFile) => {
        const {history, onTxGenerated} = this.props;

        let tx;
        if (file.type === FILE_TYPE.ACCOUNT_SCRIPT || file.type === FILE_TYPE.CONTRACT) {
            tx = setScript({
                script: base64,
                chainId: this.props.chainId,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
            })
            delete tx.senderPublicKey
            delete tx.id
        }
        if (file.type === FILE_TYPE.ASSET_SCRIPT) {
            tx = setAssetScript({
                assetId: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', //Dummy assetId
                script: base64,
                chainId: this.props.chainId,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', // Dummy senderPk Only to create tx
            })
            delete tx.senderPublicKey
            delete tx.assetId
            delete tx.id
        }

        if (tx != null) {
            onTxGenerated(JSON.stringify(tx, null, 2))
            history.push(`signer`)
        }
    };

    handleIssue = (base64:string) => {
        const {history, onTxGenerated} = this.props;
        const tx = issue({
            script: 'base64:' + base64,
            name: 'test',
            description: 'test',
            quantity: 1000,
            reissuable: true,
            chainId: this.props.chainId,
            senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
        });
        delete tx.senderPublicKey;
        delete tx.id;
        delete tx.description;
        delete tx.name;
        delete tx.quantity;

        onTxGenerated(JSON.stringify(tx, null, 2));
        history.push(`signer`)
    };

    render() {
        const {file, onCopy, classes} = this.props;

        if (!file || !file.content) {
            return <EmptyMessage/>
        }
        const compilationResult = RideJS.compile(file.content);
        //const compilationResult = file.type === FILE_TYPE.CONTRACT ? safeCompileContract(file.content): safeCompile(file.content);

        if ('error' in compilationResult) {
            return <ErrorMessage message={compilationResult.error}/>
        }

        const base64 = compilationResult.result.base64 || '';

        const ellipsis = (s: string, max: number): string => {
            let trimmed = s.slice(0, max)
            if (trimmed.length < s.length)
                trimmed += '...'
            return trimmed
        }

        const ellipsisVal = ellipsis(base64, 500);

        return (<div className={classes!.root}>
            <div> Script size: {compilationResult.result.size} bytes</div>
            <ScriptInfo base64={base64}/>
            <div style={{flex: 1}}>
                <div> You can copy base64:</div>
                <div className={classes!.base64}>{ellipsisVal}</div>
            </div>
            <div>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                        if (copyToClipboard(base64)) {
                            onCopy()
                        }
                    }}>
                    Copy base64 to clipboard
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    children={`Deploy ${file.type}`}
                    color="primary"
                    onClick={() => this.handleDeploy(base64, file)}
                />
                {file.type === FILE_TYPE.ASSET_SCRIPT &&
                <Button
                    style={{marginTop:5}}
                    variant="contained"
                    fullWidth
                    children={`Issue token`}
                    color="primary"
                    onClick={() => this.handleIssue(base64)}
                />
                }
            </div>
        </div>)
    }
}


const EmptyMessage = () => (
    <div style={{margin: '10px'}}>
            <span>
                Here will be your script base64 binary.
                Write some code or use samples from above.
            </span>
    </div>
)


const ErrorMessage = ({message}: { message: string }) => (<div style={{margin: 10, padding: 16}}>{message}</div>)



export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(withRouter(BinaryTab)))
