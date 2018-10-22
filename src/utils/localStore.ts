import {RootState} from "../store";

export const loadState = (): RootState | undefined => {
    try {
        const state: RootState = JSON.parse(localStorage.getItem('store') as string)
        return state || undefined

    } catch (error) {
        console.log(error)
        return undefined
    }

}
export const saveState = (state: RootState): void => {
    localStorage.setItem('store', JSON.stringify(state))
}