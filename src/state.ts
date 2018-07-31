import { compile } from '@waves/ride-js'

export interface ICompilationResult {
  result?: ArrayBuffer
  error?: string
  ast?: any
}

export interface IEditorState {
  label: string,
  code: string
  compilationResult?: ICompilationResult
}

export const defaultEditorState = {
  label: 'undefined',
  code: ''
}

export interface ICodingState {
  selectedEditor?: number
  editors: IEditorState[]
}

export interface IEnvironmentState {
  SEED: string,
  CHAIN_ID: string,
  API_BASE: string
}

export const getCurrentEditor = (coding: ICodingState): IEditorState | undefined => {
  const editor = (coding.selectedEditor == undefined) ? undefined : coding.editors[coding.selectedEditor]
  if (editor) {
    try {
      compile(editor.code)
    } catch (error) {
      console.log(error)
    }
  }

  return editor
}
export const defaultCodingState: ICodingState = {
  editors: [],
}

export const defaultEnv: IEnvironmentState = {
  SEED: 'industry unable prison quantum cram toast produce panda slow position coffee energy awesome route quarter',
  CHAIN_ID: 'T',
  API_BASE: 'https://testnodes.wavesnodes.com/'
}

export interface IAppState {
  snackMessage: string
  coding: ICodingState,
  env: IEnvironmentState
}

export const defaultAppState: IAppState = {
  coding: defaultCodingState,
  snackMessage: '',
  env: defaultEnv
}