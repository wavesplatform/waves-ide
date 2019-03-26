import EventEmitter from 'wolfy87-eventemitter';

// TO DO нужно добавить generics в методах
class Mediator {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  subscribe(eventName: string, callback: (...args: any[]) => void) {
    this.eventEmitter.on(eventName, callback);
  }

  unsubscribe(eventName: string, callback: (...args: any[]) => void) {
    this.eventEmitter.off(eventName, callback);
  }

  dispatch(eventName: string, ...args: any[]) {
    this.eventEmitter.trigger(eventName, args);
  }
}

export default Mediator;
