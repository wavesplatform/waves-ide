import * as React from 'react'
import {connect} from 'react-redux'
import Button from '@material-ui/core/Button';
import {IAppState, getCurrentEditor} from '../../state'
import {copyToClipboard} from '../../utils/copyToClipboard'
import {bufferToBase64} from '../../utils/bufferToBase64'
import {notifyUser} from '../../actions'

const mapStateToProps = (state: IAppState) => ({compilationResult: (getCurrentEditor(state.coding) || {compilationResult: null}).compilationResult})

const mapDispatchToProps = (dispatch) => ({
    onCopy: () => {
        dispatch(notifyUser("Copied!"))
    }
})

const binaryTab = ({compilationResult, onCopy}) => {
    if (!compilationResult || compilationResult.error) {
        return <div style={{margin: '10px'}}><span>
      Here will be your script base64 binary.
      Write some code or use samples from above.
    </span>
        </div>
    }


    const base64 = !compilationResult || compilationResult.error ? undefined : bufferToBase64(new Uint8Array(compilationResult.result))
    const elipsis = (s: string, max: number): string => {
        let trimmed = s.slice(0, max)
        if (trimmed.length < s.length)
            trimmed += '...'
        return trimmed
    }

    return (<div style={{marginTop: '10px'}}>
        <span style={{margin: '15px'}}>You can copy base64:</span>
        <span style={{margin: '15px'}} className='binary-span'>{elipsis(base64, 700)}</span>
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

export const BinaryTab = connect(mapStateToProps, mapDispatchToProps)(binaryTab)
