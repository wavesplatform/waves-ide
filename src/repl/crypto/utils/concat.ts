export function concatUint8Arrays(...args: Uint8Array[]): Uint8Array {

    if (args.length < 2) {
        throw new Error('Two or more Uint8Array are expected');
    }

    if (!(args.every((arg) => arg instanceof Uint8Array))) {
        throw new Error('One of arguments is not a Uint8Array');
    }

    const count = args.length;
    const sumLength = args.reduce((sum, arr) => sum + arr.length, 0);

    const result = new Uint8Array(sumLength);

    let curLength = 0;

    for (let i = 0; i < count; i++) {
        result.set(args[i], curLength);
        curLength += args[i].length;
    }

    return result;

}
