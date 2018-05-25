export interface IEditorState {
  code: string
  compilationResult?: ICompilationResult
}

export const defaultEditorState = {
  code: ''
}

export interface ICodingState {
  selectedEditor: number
  editors: IEditorState[]
}

export const defaultCodingState = {
  selectedEditor: 0,
  editors: [defaultEditorState]
}

export interface IAppState {
  snackMessage: string
  coding: ICodingState
}

export const defaultAppState: IAppState = {
  coding: defaultCodingState,
  snackMessage: ''
}