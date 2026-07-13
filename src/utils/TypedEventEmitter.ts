type TEventHandler = (...args: any[]) => void;

export default class TypedEventEmitter {
    private handlers = new Map<string, Set<TEventHandler>>();

    on(eventName: string, handler: TEventHandler) {
        const eventHandlers = this.handlers.get(eventName) || new Set<TEventHandler>();
        eventHandlers.add(handler);
        this.handlers.set(eventName, eventHandlers);
    }

    once(eventName: string, handler: TEventHandler) {
        const onceHandler: TEventHandler = (...args: any[]) => {
            this.off(eventName, onceHandler);
            handler(...args);
        };

        this.on(eventName, onceHandler);
    }

    off(eventName: string, handler: TEventHandler) {
        const eventHandlers = this.handlers.get(eventName);

        if (!eventHandlers) {
            return;
        }

        eventHandlers.delete(handler);

        if (eventHandlers.size === 0) {
            this.handlers.delete(eventName);
        }
    }

    emit(eventName: string, ...args: any[]) {
        const eventHandlers = this.handlers.get(eventName);

        if (!eventHandlers) {
            return;
        }

        [...eventHandlers].forEach((handler) => handler(...args));
    }
}
