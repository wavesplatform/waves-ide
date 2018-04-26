import { applyMiddleware, compose, Store, createStore, combineReducers, AnyAction } from 'redux'
import { IAppState, IEditorState } from './state'

export const editorCodeChange = (code): AnyAction => ({
  type: 'EDITOR_CODE_CHANGE',
  code
})

function editorReducer(editorState: IEditorState = { code: '' }, action: AnyAction): IEditorState {
  if (action.type == 'EDITOR_CODE_CHANGE') {
    return { code: action.code }
  }

  return editorState
}

export const store = createStore(combineReducers({ editor: editorReducer }))


