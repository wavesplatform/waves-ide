export interface IHistoryLike {
    push: (path: string) => void
    replace: (path: string) => void
    location: {
        pathname: string
    }
}

const dispatchLocationChange = () => {
    window.dispatchEvent(new PopStateEvent('popstate'));
};

export const createBrowserHistoryLike = (): IHistoryLike => ({
    push(path: string) {
        window.history.pushState({}, '', path);
        dispatchLocationChange();
    },
    replace(path: string) {
        window.history.replaceState({}, '', path);
        dispatchLocationChange();
    },
    get location() {
        return { pathname: window.location.pathname };
    }
});
