import JSONTree from 'react-json-tree'
import { palette } from '../style';
import * as React from 'react'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { FlatButton } from 'material-ui'
import { IAppState, IEditorState, getCurrentEditor } from './../state'
import { contextAware } from './../utils/contextAware'
import { copyToClipboard } from './../utils/copyToClipboard'
import { notifyUser } from './../store'

const mapStateToProps = (state: IAppState) => ({ compilationResult: (getCurrentEditor(state.coding) || { compilationResult: null }).compilationResult })

const mapDispatchToProps = (dispatch) => ({
  onCopy: () => {
    dispatch(notifyUser("Coppied!"))
  }
})

const binaryTab = ({ compilationResult, onCopy }) => {
  if (!compilationResult || compilationResult.error) {
    return <div style={{ margin: '10px' }}><span>
      Here will be your script base58 binary.
      Write some code or use samples from above.
    </span>
    </div>
  }

  const value = !compilationResult || compilationResult.error ? 'none' : compilationResult.result
  const elipsis = (s: string, max: number): string => {
    let trimmed = s.slice(0, max)
    if (trimmed.length < s.length)
      trimmed += '...'
    return trimmed
  }
  let snack = false
  return (<div style={{ marginTop: '10px' }}>
    <span style={{ margin: '15px' }}>Script base58:</span>
    <span style={{ margin: '15px' }} className='binary-span'>{elipsis(value, 700)}</span>
    <FlatButton label="Copy to clipboard" hoverColor='transparent' onClick={() => {
      if (copyToClipboard(value)) {
        onCopy()
      }
    }} />
  </div>)
}

export const BinaryTab = connect(mapStateToProps, mapDispatchToProps)(binaryTab)
