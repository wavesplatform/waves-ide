import { createStore, combineReducers, compose, applyMiddleware } from 'redux'
import { IEditorState, ICodingState, defaultCodingState, getCurrentEditor, IAppState, IEnvironmentState, defaultEnv } from './state'
import { codeSamples } from './samples'
import { compile } from '@waves/ride-js'
import {Repl} from 'waves-repl'

export enum ActionType {
  EDITOR_CODE_CHANGE = '1',
  NOTIFY_USER = '2',
  NEW_EDITOR_TAB = '3',
  CLOSE_EDITOR_TAB = '4',
  SELECT_EDITOR_TAB = '5',
  LOAD_STATE = '6',
  RENAME_EDITOR_TAB = '7',
  CHANGE_ENV_FIELD = '8'
}

type ReduxAction = EDITOR_CODE_CHANGE | NOTIFY_USER | NEW_EDITOR_TAB | CLOSE_EDITOR_TAB | SELECT_EDITOR_TAB | LOAD_STATE | RENAME_EDITOR_TAB | CHANGE_ENV_FIELD

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

interface RENAME_EDITOR_TAB {
  type: ActionType.RENAME_EDITOR_TAB
  index: number
  text: string
}

interface SELECT_EDITOR_TAB {
  type: ActionType.SELECT_EDITOR_TAB
  index: number
}
interface CLOSE_EDITOR_TAB {
  type: ActionType.CLOSE_EDITOR_TAB
  index: number
}

interface LOAD_STATE {
  type: ActionType.LOAD_STATE
}

interface CHANGE_ENV_FIELD {
  type: ActionType.CHANGE_ENV_FIELD
  field: string
  value: string
}

export const loadState = (): LOAD_STATE => ({
  type: ActionType.LOAD_STATE
})

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

export const renameEditorTab = (index: number, text: string): RENAME_EDITOR_TAB => ({
  type: ActionType.RENAME_EDITOR_TAB,
  index,
  text
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

export const changeEnvField = (field: string, value: string): CHANGE_ENV_FIELD => ({
  type: ActionType.CHANGE_ENV_FIELD,
  field,
  value
})

function coding(state: ICodingState = defaultCodingState, action: ReduxAction): ICodingState {
  //ToDo: make object copy
  let newState = state

  if (action.type == ActionType.LOAD_STATE) {
    try {
      const loadedCoding: ICodingState = JSON.parse(localStorage.getItem('store'))
      if (loadedCoding) {
        if (loadedCoding.editors && loadedCoding.selectedEditor != undefined) {
          newState = loadedCoding
        }
      }

    } catch (error) {
      console.log(error)
    }
  }
  if (action.type == ActionType.EDITOR_CODE_CHANGE) {
    const editors = state.editors.map((e: IEditorState, i): IEditorState => {
      if (i !== state.selectedEditor)
        return e

      return {
        ...e,
        code: action.code,
        compilationResult: compile(action.code)
      }
    })

    newState = { ...state, editors }
  }
  if (action.type == ActionType.CLOSE_EDITOR_TAB) {
    let newIndex = action.index - 1

    if (state.editors.length - 1 <= 0)
      newIndex = null

    if (newIndex < 0)
      newIndex = 0

    if (newIndex > state.editors.length - 2)
      newIndex = state.editors.length - 2

    newState = {
      ...state, editors: [
        ...state.editors.slice(0, action.index),
        ...state.editors.slice(action.index + 1)
      ],
      selectedEditor: newIndex
    }
  }
  if (action.type == ActionType.RENAME_EDITOR_TAB) {
    const editors = state.editors.map((e: IEditorState, i): IEditorState => {
      if (i != action.index)
        return e

      return {
        ...e,
        label: action.text
      }
    })
    newState = { ...state, editors }
  }
  if (action.type == ActionType.NEW_EDITOR_TAB) {
    const indexes = state.editors.map(n => n.label)
        .filter(l => l.startsWith('undefined_'))
        .map(x => parseInt(x.replace('undefined_', '')))
        .sort()
    const newIndex = 1 + (indexes[indexes.length - 1] || 0)

    newState = {
      ...state, editors: [
        ...state.editors,
        {
          label: 'undefined_' + newIndex,
          code: action.code,
          compilationResult: compile(action.code)
        },
      ],
      selectedEditor: state.editors.length
    }
  }
  if (action.type == ActionType.SELECT_EDITOR_TAB) {
    newState = {
      ...state,
      selectedEditor: action.index
    }
  }

   return newState
}

function stringReducer(value: string = '', action: ReduxAction): string {
  if (action.type == ActionType.NOTIFY_USER) {
    return action.message
  }
  return value
}

function env(state: IEnvironmentState = defaultEnv, action: ReduxAction): IEnvironmentState {
  if (action.type == ActionType.CHANGE_ENV_FIELD) {
    const c = { ...state }
    c[action.field] = action.value
    return c
  }
  return state
}


const syncReplEnvMiddleware = applyMiddleware(store => next => action => {
    const nextAction = next(action);
    const state:any = store.getState(); // new state after action was applied

    if (action.type === ActionType.CHANGE_ENV_FIELD) {
       Repl.updateEnv(state.env)
    }

    Repl.updateEnv(state.coding);
    return nextAction;
});

const middlewares = [
    syncReplEnvMiddleware
]

if ((<any>window).__REDUX_DEVTOOLS_EXTENSION__) {
    middlewares.push((<any>window).__REDUX_DEVTOOLS_EXTENSION__());
}

const rootReducer = combineReducers({ coding, snackMessage: stringReducer, env })

export const store = createStore(rootReducer, compose(...middlewares))
