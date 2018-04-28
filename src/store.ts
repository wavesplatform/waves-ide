import { applyMiddleware, compose, Store, createStore, combineReducers, AnyAction } from 'redux'
import { IAppState, IEditorState } from './state'
import { codeSamples } from './samples';

export const editorCodeChange = (code): AnyAction => ({
  type: 'EDITOR_CODE_CHANGE',
  code
})

export const loadSample = (id: 'simple' | 'notary'| 'multisig'): AnyAction => ({
  type: 'EDITOR_CODE_CHANGE',
  code: codeSamples[id]
})

function editorReducer(editorState: IEditorState = { code: '' }, action: AnyAction): IEditorState {
  if (action.type == 'EDITOR_CODE_CHANGE') {
    return {
      code: action.code,
      compilationResult: compile(action.code)
    }
  }

  return editorState
}

export const store = createStore(combineReducers({ editor: editorReducer }))
