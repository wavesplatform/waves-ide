import { applyMiddleware, compose, Store, createStore, combineReducers, AnyAction } from 'redux'
import { IAppState, IEditorState } from './state'

export const editorCodeChange = (code): AnyAction => ({
  type: 'EDITOR_CODE_CHANGE',
  code
})

export const closeDialog = (): AnyAction => ({
  type: 'CLOSE_DIALOG'
})

export const openDialog = (): AnyAction => ({
  type: 'OPEN_DIALOG'
})

function isDialogOpen(state: boolean = false, action: AnyAction): boolean {
  switch (action.type) {
    case 'CLOSE_DIALOG':
      return false
    case 'OPEN_DIALOG':
      return true
  }
  return state
}

function editorReducer(editorState: IEditorState = { code: '' }, action: AnyAction): IEditorState {
  if (action.type == 'EDITOR_CODE_CHANGE') {
    return { code: action.code }
  }

  return editorState
}

export const store = createStore(combineReducers({ editor: editorReducer, isDialogOpen }))


