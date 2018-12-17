import * as React from 'react'
import {connect, Dispatch} from 'react-redux'
import Button from '@material-ui/core/Button';
import {copyToClipboard} from '../../utils/copyToClipboard'
import {userNotification} from '../../store/notifications/actions'
import {RootAction, RootState} from "../../store";
import {StyledComponentProps, Theme} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";

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

    return {compilationResult: selectedEditor && selectedEditor.compilationResult}
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    onCopy: () => {
        dispatch(userNotification("Copied!"))
    }
})

interface IBinaryTabProps extends StyledComponentProps<keyof ReturnType<typeof styles>>, ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {

}

const binaryTab = ({compilationResult, onCopy, classes}: IBinaryTabProps) => {
    if (!compilationResult) {
        return (<div style={{margin: '10px'}}>
            <span>
                Here will be your script base64 binary.
                Write some code or use samples from above.
            </span>
        </div>);
    } else if (compilationResult.error) {
        return (<div style={{margin: 10, padding: 16}}>{compilationResult.error}</div>);
    }

    const base64 = !compilationResult || compilationResult.error ? '' : compilationResult.result!
    const elipsis = (s: string, max: number): string => {
        let trimmed = s.slice(0, max)
        if (trimmed.length < s.length)
            trimmed += '...'
        return trimmed
    }

    return (<div style={{marginTop: '10px'}}>
        <span style={{margin: '15px'}}>You can copy base64:</span>
        <span style={{margin: '15px'}} className={classes!.binarySpan}>{elipsis(base64, 700)}</span>
        <Button
            variant="text"
            onClick={() => {
                if (copyToClipboard(base64)) {
                    onCopy()
                }
            }}>
            Copy base64 to clipboard
        </Button>
    </div>)
}

export const BinaryTab = withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(binaryTab))
