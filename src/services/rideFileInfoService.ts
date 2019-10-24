import { ICompilationError, ICompilationResult } from '@waves/ride-js';
import worker from '@src/worker.js';
import WebWorker from '@src/workerSetup';
import EventEmitter from 'wolfy87-eventemitter';

export type TRideFileType = 'account' | 'asset' | 'dApp' | 'library';

export interface IRideFileInfo {
    readonly stdLibVersion: number,
    readonly type: TRideFileType,
    readonly maxSize: number,
    readonly maxComplexity: number,
    readonly compilation: ICompilationResult | ICompilationError,
    readonly size: number,
    readonly complexity: number
}

class RideInfoService extends EventEmitter {
    worker: any;
    id = 0
    constructor() {
        super();
        this.worker = new WebWorker(worker(window.location.origin));
        this.worker.addEventListener('message', (event: any) => {
            this.emit('result', [event.data]);
        });
    }

    async provideInfo(content: string): Promise<IRideFileInfo | null> {
        const msgId = ++this.id
        this.worker.postMessage({content, msgId} );
        return new Promise((resolve, reject) => {
            this.once('result + id', (info: IRideFileInfo) => resolve(info))
        });
    }

}

export default new RideInfoService();
