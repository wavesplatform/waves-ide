import { editor } from "components/editor";

export interface IEditorState {
  code: string
  compilationResult?: ICompilationResult
}

export const defaultEditorState = {
  code: ''
}

export interface ICodingState {
  selectedEditor?: number
  editors: IEditorState[]
}

export const getCurrentEditor = (coding: ICodingState): IEditorState | undefined =>
  (coding.selectedEditor == undefined) ? undefined : coding.editors[coding.selectedEditor]

export const defaultCodingState: ICodingState = {
  editors: [],
}

export interface IAppState {
  snackMessage: string
  coding: ICodingState
}

export const defaultAppState: IAppState = {
  coding: defaultCodingState,
  snackMessage: ''
}