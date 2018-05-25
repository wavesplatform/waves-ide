import { applyMiddleware, compose, Store, createStore, combineReducers, AnyAction } from 'redux'
import { IAppState, IEditorState, defaultAppState, ICodingState, defaultCodingState } from './state'
import { codeSamples } from './samples';

export const editorCodeChange = (code): AnyAction => ({
  type: 'EDITOR_CODE_CHANGE',
  code
})


export const notifyUser = (message): AnyAction => ({
  type: 'NOTIFY_USER',
  message
})


export const loadSample = (id: 'simple' | 'notary' | 'multisig'): AnyAction => ({
  type: 'EDITOR_CODE_CHANGE',
  code: codeSamples[id]
})

function coding(state: ICodingState = defaultCodingState, action: AnyAction): ICodingState {
  if (action.type == 'EDITOR_CODE_CHANGE') {
    const editor = state.editors[state.selectedEditor]
    const editors = state.editors.map((e: IEditorState, i): IEditorState => {
      if (i !== state.selectedEditor)
        return e

      return {
        code: action.code,
        compilationResult: compile(action.code)
      }
    })

    return { ...state, editors }
  }

  return state
}

function stringReducer(value: string = '', action: AnyAction): string {
  if (action.type == 'NOTIFY_USER') {
    return action.message
  }
  return value
}

export const store = createStore(combineReducers({ coding, snackMessage: stringReducer }))
