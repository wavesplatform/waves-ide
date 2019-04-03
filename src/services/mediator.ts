import EventEmitter from 'wolfy87-eventemitter';

interface IEventDisposer {
  (): void;
}

// TO DO нужно добавить generics в методах
export class Mediator {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  subscribe(eventName: string, callback: (...args: any[]) => void): IEventDisposer {
    this.eventEmitter.on(eventName, callback);

    return () => this.eventEmitter.off(eventName, callback);
  }

  unsubscribe(eventName: string, callback: (...args: any[]) => void) {
    this.eventEmitter.off(eventName, callback);
  }

  dispatch(eventName: string, ...args: any[]) {
    this.eventEmitter.trigger(eventName, args);
  }
}

export default new Mediator();

export {
  IEventDisposer
};
