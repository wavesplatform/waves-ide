
export const loadState = (): any | undefined => {
    try {
        const state = JSON.parse(localStorage.getItem('store') as string);
        return state || undefined;

    } catch (error) {
        console.log(error);
        return undefined;
    }

};
export const saveState = (state: any): void => {
    localStorage.setItem('store', JSON.stringify(state));
};
