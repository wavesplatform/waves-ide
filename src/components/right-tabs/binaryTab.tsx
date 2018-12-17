import * as React from 'react'
import {connect, Dispatch} from 'react-redux'
import Button from '@material-ui/core/Button';
import {copyToClipboard} from '../../utils/copyToClipboard'
import {userNotification} from '../../store/notifications/actions'
import {RootAction, RootState} from "../../store";
import {StyledComponentProps, Theme} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import {safeCompile} from "../../utils/safeCompile";
import {FILE_TYPE} from "../../store/files/reducer";
import {setAssetScript, setScript} from "@waves/waves-transactions";
import {txGenerated} from "../../store/txEditor/actions";
import {RouteComponentProps, withRouter} from "react-router";

const styles = (theme: Theme) => ({
    binarySpan: {
        display: 'block',
        wordWrap: 'break-word',
        fontSize: '10px',
        color: 'lightgrey'
    }
});


const mapStateToProps = (state: RootState) => {
    const selectedEditor = state.editors.editors[state.editors.selectedEditor];
    if (!selectedEditor) return {file: undefined};
    const file = state.files.find(file => file.id === selectedEditor.fileId);
    return {file: file}
}

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

const binaryTab = ({file, onCopy, onTxGenerated, history, classes}: IBinaryTabProps) => {

    if (!file || !file.content) {
        return (<div style={{margin: '10px'}}>
            <span>
                Here will be your script base64 binary.
                Write some code or use samples from above.
            </span>
        </div>);
    }

    const compilationResult = safeCompile(file.content);

    if (compilationResult.error) {
        return (<div style={{margin: 10, padding: 16}}>{compilationResult.error}</div>);
    }

    const base64 = compilationResult.result || ''

    const elipsis = (s: string, max: number): string => {
        let trimmed = s.slice(0, max)
        if (trimmed.length < s.length)
            trimmed += '...'
        return trimmed
    }
    const elipsisVal = elipsis(base64, 350)

    const handleSignAndDeploy = () => {
        let tx;
        if (file.type === FILE_TYPE.ACCOUNT_SCRIPT) {
            tx = setScript({
                script: base64,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr' // Dummy senderPk Only to create tx
            })
            delete tx.senderPublicKey
        }
        if (file.type === FILE_TYPE.TOKEN_SCRIPT) {
            tx = setAssetScript({
                assetId: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', //Dummy assetId
                script: base64,
                senderPublicKey: 'DT5bC1S6XfpH7s4hcQQkLj897xnnXQPNgYbohX7zZKcr', // Dummy senderPk Only to create tx
            })
            delete tx.senderPublicKey
            delete tx.assetId
        }

        if (tx != null) {
            onTxGenerated(JSON.stringify(tx, null, 2))

            history.push(`signer`)
        }
    }

    return (<div style={{marginTop: '10px'}}>
        <span style={{margin: '15px'}}>You can copy base64:</span>
        <span style={{margin: '15px'}} className={classes!.binarySpan}>{elipsisVal}</span>
        <Button
            variant="text"
            onClick={() => {
                if (copyToClipboard(base64)) {
                    onCopy()
                }
            }}>
            Copy base64 to clipboard
        </Button>
        <Button
            variant="contained"
            children="Sign and publish"
            color="primary"
            onClick={handleSignAndDeploy}
        />
    </div>)
}

export const BinaryTab = withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(withRouter(binaryTab)))
