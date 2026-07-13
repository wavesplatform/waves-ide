import TypedEventEmitter from '@utils/TypedEventEmitter';

interface IEventDisposer {
  (): void;
}

// TO DO нужно добавить generics в методах
export class Mediator {
  private eventEmitter: TypedEventEmitter;

  constructor() {
    this.eventEmitter = new TypedEventEmitter();
  }

  subscribe(eventName: string, callback: (...args: any[]) => void): IEventDisposer {
    this.eventEmitter.on(eventName, callback);

    return () => this.eventEmitter.off(eventName, callback);
  }

  unsubscribe(eventName: string, callback: (...args: any[]) => void) {
    this.eventEmitter.off(eventName, callback);
  }

  dispatch(eventName: string, ...args: any[]) {
    this.eventEmitter.emit(eventName, ...args);
  }
}

export default new Mediator();

export {
  IEventDisposer
};
