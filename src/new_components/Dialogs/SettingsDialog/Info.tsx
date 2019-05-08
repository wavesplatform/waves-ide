import * as React from 'react';
import styles from '@src/new_components/Dialogs/SettingsDialog/styles.less';
import Tooltip from '@src/new_components/Tooltip';

interface IProps {
    infoType?: 'Mainnet' | 'Testnet'
}

type TDataItem = {
    title: string,
    text: string,
    more: string
};

type TInfoData = {
    Mainnet: TDataItem,
    Testnet: TDataItem
};

const infoData: TInfoData = {
    Mainnet: {
        title: 'Mainnet',
        text: 'Mainnet – short for main network – is the original and functional blockchain where actual transactions' +
            ' take place in the distributed ledger and the native cryptocurrencies possess real economic value.',
        more: 'https://docs.wavesplatform.com/en/waves-environment/waves-mainnet.html#section-96c5b680517adda6186330' +
            'd3d3ab9737'
    },
    Testnet: {
        title: 'Testnet',
        text: 'The testnet(test network) is an alternative Waves blockchain, to be used for testing.',
        more: 'https://docs.wavesplatform.com/en/waves-environment/waves-mainnet.html#section-96c5b680517adda6186330' +
            'd3d3ab9737'
    }
};

const Info = ({infoType}: IProps) =>
    <Tooltip placement="bottomLeft" trigger="hover" align={{offset: [-34, 0]}}
             overlay={
                 !infoType
                     ? <div/>
                     : <div>
                         <div className={styles.tooltip_title}>{infoData[infoType].title}</div>
                         <div className={styles.tooltip_text}>{infoData[infoType].text}</div>
                         <a className={styles.tooltip_more} href={infoData[infoType].more} target="_blank">Show more</a>
                     </div>
             }
    >
        <div className={styles.info}/>
    </Tooltip>;


export default Info;
