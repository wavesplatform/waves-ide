import { compile } from '@waves/ride-js'


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

export const getCurrentEditor = (coding: ICodingState): IEditorState | undefined => {
  const editor = (coding.selectedEditor == undefined) ? undefined : coding.editors[coding.selectedEditor]
  if (editor) {
    try {
      const a = compile(editor.code)
      console.log(a)
    } catch (error) {
      console.log(error)
    }
  }

  return editor
}
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