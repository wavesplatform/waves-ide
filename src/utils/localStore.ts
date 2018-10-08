import {IAppState} from "../state";

export const loadState = (): IAppState | undefined => {
    try {
        const state: IAppState = JSON.parse(localStorage.getItem('store'))
        return state

    } catch (error) {
        console.log(error)
    }

}
export const saveState = (state): void => {
    localStorage.setItem('store', JSON.stringify(state))
}