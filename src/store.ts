import { applyMiddleware, compose, Store, createStore, combineReducers, AnyAction, Action } from 'redux'
import { IAppState, IEditorState, defaultAppState, ICodingState, defaultCodingState } from './state'
import { codeSamples } from './samples';

export enum ActionType {
  EDITOR_CODE_CHANGE = '1',
  NOTIFY_USER = '2',
}

type ReduxAction = EDITOR_CODE_CHANGE | NOTIFY_USER

interface EDITOR_CODE_CHANGE {
  type: ActionType.EDITOR_CODE_CHANGE
  code: string
}

interface NOTIFY_USER {
  type: ActionType.NOTIFY_USER
  message: string
}

export const editorCodeChange = (code): EDITOR_CODE_CHANGE => ({
  type: ActionType.EDITOR_CODE_CHANGE,
  code
})

export const notifyUser = (message): NOTIFY_USER => ({
  type: ActionType.NOTIFY_USER,
  message
})


export const loadSample = (id: 'simple' | 'notary' | 'multisig'): EDITOR_CODE_CHANGE => ({
  type: ActionType.EDITOR_CODE_CHANGE,
  code: codeSamples[id]
})

function coding(state: ICodingState = defaultCodingState, action: ReduxAction): ICodingState {
  if (action.type.startsWith('@@redux')) {
    try {
      const loadedCoding: ICodingState = JSON.parse(localStorage.getItem('store'))
      if (loadedCoding) {
        if (loadedCoding.editors && loadedCoding.selectedEditor != undefined) {
          return loadedCoding
        }
      }

    } catch (error) { }
  }
  if (action.type == ActionType.EDITOR_CODE_CHANGE) {
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

function stringReducer(value: string = '', action: ReduxAction): string {
  if (action.type == ActionType.NOTIFY_USER) {
    return action.message
  }
  return value
}

export const store = createStore(combineReducers({ coding, snackMessage: stringReducer }))
