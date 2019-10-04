import { Console } from './core/components/Console';

const methods = [
    'log',
    'error',
    'dir',
    'info',
    'warn',
    'assert',
    'debug',
    'clear'
];

class WavesConsoleMethods {
    [key: string]: any;

    constructor(console: any) {
        methods.forEach(method => {
            this[method] = console[method as keyof Console];
        });
    }
}

export default WavesConsoleMethods;
