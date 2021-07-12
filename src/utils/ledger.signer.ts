import WavesLedger from '@waves/ledger';
import HwTransportWebUsb from '@ledgerhq/hw-transport-webusb';

const options = {
    debug: true, //boolean,
    openTimeout: 3000, //number,
    listenTimeout: 30000, //number,
    exchangeTimeout: 30000, //number,
    networkCode: 87, //number,
    transport: HwTransportWebUsb
};

let instanceLedger: WavesLedger;

export const getLedger = async () => {
    if(!instanceLedger) {
        instanceLedger = new WavesLedger(options);
    }

    return instanceLedger;
}
