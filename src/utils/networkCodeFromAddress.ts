import Base58 from './base58';

export function networkCodeFromAddress(address:string) {
    const rawNetworkByte = Base58.decode(address).slice(1, 2)[0];
    return String.fromCharCode(rawNetworkByte)
}