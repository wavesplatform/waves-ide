import React from 'react';
import styles from './styles.less';

const links = {
    video: [
        {
            title: 'Using Smart Contracts with Waves Console',
            link: ''
        },
        {
            title: 'Multi Signature Using Waves IDE & WavesJ',
            link: ''
        },
        {
            title: 'Escrow Using Waves IDE & WavesJ',
            link: ''
        },
        {
            title: 'Waves Console Commands Example',
            link: ''
        },
        {
            title: 'Create MultiSig Account via Waves IDE tools',
            link: ''
        }
    ],
    guides: [
        {
            title: 'The First Part',
            link: ''
        },
        {
            title: 'The Second Part',
            link: ''
        },
    ],
    forum: [
        {
            title: 'DevTools: IDE + REPL',
            link: ''
        },
    ]
};

const dapDocs = {
    title: 'Ride4DApps documentation',
    link: ''
};

export default class WelcomePage extends React.Component {

    render(): React.ReactNode {

        return <div className={styles.root}>
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
                            {i + 1}.&nbsp;<a className={styles.link} href={link}>{title}</a>
                        </div>)}
                </div>
                <div className={styles.column}>
                    <div className={styles.H3}>Hitchhiker’s Guide to Waves Smart Contracts</div>
                    {links.guides.map(({title, link}, i) =>
                        <div key={i + 1} className={styles.row}>
                            {i + 1}.&nbsp;<a className={styles.link} href={link}>{title}</a>
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
                <a className={styles.smallLink} href={dapDocs.link}>{dapDocs.title}</a>
            </div>

            <div className={styles.block}>
                <div className={styles.H3}>Forum</div>

                {links.forum.map(({title, link}, i) =>
                    <div key={i + 1} className={styles.row}>
                        {i + 1}.&nbsp;<a className={styles.link} href={link}>{title}</a>
                    </div>)}

                <div className={styles.text}>
                    This topic is for discussing your issues, requests, feedback and for announcements related to Waves
                    Ride IDE and REPL
                </div>
            </div>

        </div>;
    }

}
