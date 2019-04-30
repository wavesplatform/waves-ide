import React from 'react';
import styles from './styles.less';
import Scrollbar from '@src/new_components/Scrollbar';

const links = {
    video: [
        {
            title: 'Using Smart Contracts with Waves Console',
            link: 'https://www.youtube.com/watch?v=sOZuE9Ebfko&t=557s'
        },
        {
            title: 'Multi Signature Using Waves IDE & WavesJ',
            link: 'https://www.youtube.com/watch?v=o2msjSo0y0o&t=32s'
        },
        {
            title: 'Escrow Using Waves IDE & WavesJ',
            link: 'https://www.youtube.com/watch?v=31dwYcgb65M&t=381s'
        },
        {
            title: 'Waves Console Commands Example',
            link: 'https://www.youtube.com/watch?v=gBgLjg6nrvA&amp=&feature=youtu.be'
        },
        {
            title: 'Create MultiSig Account via Waves IDE tools',
            link: 'https://www.youtube.com/watch?v=8DKRGnwsBjk'
        }
    ],
    guides: [
        {
            title: 'The First Part',
            link: 'https://blog.wavesplatform.com/the-hitchhikers-guide-to-waves-smart-contracts-part-1-b80aa47a745a'
        },
        {
            title: 'The Second Part',
            link: 'https://blog.wavesplatform.com/the-hitchhikers-guide-to-waves-smart-contracts-part-2-44621fd5a007'
        },
    ],
    forum: [
        {
            title: 'DevTools: IDE + REPL',
            link: 'https://forum.wavesplatform.com/t/devtools-ide-repl/1992'
        },
    ]
};

const dapDocs = {
    title: 'Ride4DApps documentation',
    link: 'https://docs.wavesplatform.com/en/smart-contracts/writing-dapps.html'
};

export default class WelcomePage extends React.Component {

    render(): React.ReactNode {

        return <Scrollbar className={styles.root}>
            <div className={styles.H0}>Waves Smart Contracts</div>

            <div className={styles.block}>
                <div className={styles.H3}>Smart Contracts Documentation</div>
                <div className={styles.text}>
                    For more theoretical and technical details please go to Smart Contract Section in our documentation.
                </div>
            </div>

            <div className={styles.column_block}>
                <div className={styles.column}>
                    <div className={styles.H3}>Video Tutorials</div>
                    {links.video.map(({title, link}, i) =>
                        <div key={i + 1} className={styles.row}>
                            {i + 1}.&nbsp;<a target="_blank" className={styles.link} href={link}>{title}</a>
                        </div>)}
                </div>
                <div className={styles.column}>
                    <div className={styles.H3}>Hitchhiker’s Guide to Waves Smart Contracts</div>
                    {links.guides.map(({title, link}, i) =>
                        <div key={i + 1} className={styles.row}>
                            {i + 1}.&nbsp;<a target="_blank" className={styles.link} href={link}>{title}</a>
                        </div>)}
                </div>
            </div>

            <div className={styles.block}>
                <div className={styles.H3}>Ride4Dapps</div>
                <div className={styles.text}>
                    Ride4DApps is an update of RIDE language which main goal is to enable classic 'DApps' approach on
                    Waves by adding the ability to define and call functions in a contract. This feature is not
                    available on the mainnet yet, but IDE supports new language syntax and allows to compile and deploy
                    contracts to the testnet or your custom chain.
                </div>
                <a target="_blank" className={styles.smallLink} href={dapDocs.link}>{dapDocs.title}</a>
            </div>

            <div className={styles.block}>
                <div className={styles.H3}>Forum</div>

                {links.forum.map(({title, link}, i) =>
                    <div key={i + 1} className={styles.row}>
                        {i + 1}.&nbsp;<a target="_blank" className={styles.link} href={link}>{title}</a>
                    </div>)}

                <div className={styles.text}>
                    This topic is for discussing your issues, requests, feedback and for announcements related to Waves
                    Ride IDE and REPL
                </div>
            </div>

        </Scrollbar>;
    }

}
