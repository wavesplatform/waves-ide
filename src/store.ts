import { applyMiddleware, compose, Store, createStore, combineReducers, AnyAction, Action } from 'redux'
import { IAppState, IEditorState, defaultAppState, ICodingState, defaultCodingState } from './state'
import { codeSamples } from './samples';
import { stat } from 'fs';

export enum ActionType {
  EDITOR_CODE_CHANGE = '1',
  NOTIFY_USER = '2',
  NEW_EDITOR_TAB = '3',
  CLOSE_EDITOR_TAB = '4',
  SELECT_EDITOR_TAB = '5',
}

type ReduxAction = EDITOR_CODE_CHANGE | NOTIFY_USER | NEW_EDITOR_TAB | CLOSE_EDITOR_TAB | SELECT_EDITOR_TAB

interface EDITOR_CODE_CHANGE {
  type: ActionType.EDITOR_CODE_CHANGE
  code: string
}

interface NOTIFY_USER {
  type: ActionType.NOTIFY_USER
  message: string
}

interface NEW_EDITOR_TAB {
  type: ActionType.NEW_EDITOR_TAB
  code?: string
}

interface SELECT_EDITOR_TAB {
  type: ActionType.SELECT_EDITOR_TAB
  index: number
}
interface CLOSE_EDITOR_TAB {
  type: ActionType.CLOSE_EDITOR_TAB
  index: number
}

export const editorCodeChange = (code): EDITOR_CODE_CHANGE => ({
  type: ActionType.EDITOR_CODE_CHANGE,
  code
})

export const notifyUser = (message): NOTIFY_USER => ({
  type: ActionType.NOTIFY_USER,
  message
})

export const selectEditorTab = (index: number): SELECT_EDITOR_TAB => ({
  type: ActionType.SELECT_EDITOR_TAB,
  index
})

export const closeEditorTab = (index: number): CLOSE_EDITOR_TAB => ({
  type: ActionType.CLOSE_EDITOR_TAB,
  index
})

export const newEditorTab = (code?: string): NEW_EDITOR_TAB => ({
  type: ActionType.NEW_EDITOR_TAB,
  code
})

export const loadSample = (id: 'simple' | 'notary' | 'multisig'): NEW_EDITOR_TAB => ({
  type: ActionType.NEW_EDITOR_TAB,
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
  if (action.type == ActionType.CLOSE_EDITOR_TAB) {
    return {
      ...state, editors: [
        ...state.editors.slice(0, action.index),
        ...state.editors.slice(action.index + 1)
      ],
    }
  }
  if (action.type == ActionType.NEW_EDITOR_TAB) {
    return {
      ...state, editors: [
        ...state.editors,
        {
          code: action.code,
          compilationResult: compile(action.code)
        },
      ],
      selectedEditor: state.editors.length
    }
  }
  if (action.type == ActionType.SELECT_EDITOR_TAB) {
    return {
      ...state,
      selectedEditor: action.index
    }
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
