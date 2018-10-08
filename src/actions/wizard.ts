import {ActionType} from "./index"


interface OPEN_WIZARD {
    type: ActionType.OPEN_WIZARD,
    kind: string
}

interface CLOSE_WIZARD {
    type: ActionType.CLOSE_WIZARD
}

interface CREATE_CONTRACT {
    type: ActionType.CREATE_CONTRACT
}

export type WizardAction = OPEN_WIZARD | CLOSE_WIZARD | CREATE_CONTRACT

export const openWizard = (kind:string): OPEN_WIZARD => ({
    type:ActionType.OPEN_WIZARD,
    kind
})

export const closeWizard = (): CLOSE_WIZARD => ({
    type:ActionType.CLOSE_WIZARD
})