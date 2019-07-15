let KeyboardService = (() => {
    let __pressed: string[] = [];
    let __subscribers: { keys: string[], callback: () => void }[] = [];

    let onKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;

        __pressed = [...__pressed, e.key];

        publish(e);
    };

    let onKeyUp = (e: KeyboardEvent) => {
        __pressed = __pressed.filter(key => e.key !== key);
    };

    let publish = (e: KeyboardEvent) => {
        __subscribers
            .filter(({keys}) => (
                keys.every(key => __pressed.includes(key))
            ))
            .forEach(({callback}) => {
                e.preventDefault();
                e.stopPropagation();
                __pressed = [];
                callback();
            });
    };

    let subscribe = (keys: string[], callback: () => void) => {
        __subscribers = [...__subscribers, {keys, callback}];
        bindEvents();
    };

    let unsubscribe = (callback: () => void) => {
        __subscribers = __subscribers.filter(({callback: subscriber}) => subscriber !== callback);

        if (__subscribers.length === 0) {
            unbindEvents();
        }
    };

    let bindEvents = () => {
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
    };

    let unbindEvents = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    };

    return {subscribe, unsubscribe};
})();

export default KeyboardService;
