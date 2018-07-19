import * as React from 'react'
import { connect } from 'react-redux'
import { FlatButton } from 'material-ui'
import { IAppState, getCurrentEditor } from './../state'
import { copyToClipboard } from './../utils/copyToClipboard'
import { notifyUser } from './../store'
import * as Base58 from './../base58'

const mapStateToProps = (state: IAppState) => {
  const c = ({ compilationResult: (getCurrentEditor(state.coding) || { compilationResult: null }).compilationResult })
  console.log(c)

  return c
}

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

  function bufferToBase64(buf) {
    var binstr = Array.prototype.map.call(buf, function (ch) {
      return String.fromCharCode(ch);
    }).join('')
    return btoa(binstr)
  }

  const base58 = !compilationResult || compilationResult.error ? undefined : Base58.encode(new Uint8Array(compilationResult.result))
  const base64 = !compilationResult || compilationResult.error ? undefined : bufferToBase64(new Uint8Array(compilationResult.result))
  const elipsis = (s: string, max: number): string => {
    let trimmed = s.slice(0, max)
    if (trimmed.length < s.length)
      trimmed += '...'
    return trimmed
  }
  let snack = false

  console.log("RENDER!")
  console.log(compilationResult)

  return (<div style={{ marginTop: '10px' }}>
    <span style={{ margin: '15px' }}>You can use base58 or base64 representations:</span>
    <span style={{ margin: '15px' }} className='binary-span'>{elipsis(base58, 700)}</span>
    <FlatButton label="Copy base58 to clipboard" hoverColor='transparent' onClick={() => {
      if (copyToClipboard(base58)) {
        onCopy()
      }
    }} />
    <span style={{ margin: '15px' }} className='binary-span'>{elipsis(base64, 700)}</span>
    <FlatButton label="Copy base64 to clipboard" hoverColor='transparent' onClick={() => {
      if (copyToClipboard(base64)) {
        onCopy()
      }
    }} />
  </div>)
}

export const BinaryTab = connect(mapStateToProps, mapDispatchToProps)(binaryTab)
