import React from 'react';
import styles from './styles.less';
import Scrollbar from '@src/components/Scrollbar';
import LinkComponent from '@components/Link';


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
    ], tools: [
        {title: 'VSCode plugin', link: 'https://marketplace.visualstudio.com/items?itemName=wavesplatform.waves-ride'},
        {title: 'Surfboard CLI tool', link: 'https://www.npmjs.com/package/@waves/surfboard'},
        {title: 'Waves private node', link: 'https://hub.docker.com/r/wavesplatform/waves-private-node'}
    ]
};

const rideDocs = {
    title: 'ride documentation',
    link: 'https://docs.wavesplatform.com/en/ride/about-ride.html'
};
const dapDocs = {
    title: 'writing dApps',
    link: 'https://docs.wavesplatform.com/en/smart-contracts/writing-dapps.html'
};

const toolingArticle = {
    title: 'Professional toolkit for coding with RIDE',
    link: 'https://blog.wavesplatform.com/how-to-build-deploy-and-test-a-waves-ride-dapp-785311f58c2'
};

interface ILinkProps {
    title: string,
    link: string
}

const Link = ({title, link}: ILinkProps) =>
    <LinkComponent className={styles.link} href={link}>{title}</LinkComponent>;

export default class WelcomePage extends React.Component {

    render(): React.ReactNode {

        return <Scrollbar className={styles.root}>
            <div className={styles.H0}>Waves dApps</div>

            <div className={styles.block}>
                <div className={styles.H3}>Ride language</div>
                <div className={styles.text}>
                    Waves blockchain uses functional programming language based on expressions called RIDE.
                    It is simple, yet efficient. Please check <Link {...rideDocs}/>
                </div>
            </div>

            <div className={styles.block}>
                <div className={styles.H3}>Writing dApps</div>
                <div className={styles.text}>
                    A dApp, or decentralised application, is an application, that executes in a distributed computer
                    system, for instance, in a blockchain. In particular, Waves dApp is an application, written in RIDE
                    language and executed on the nodes of the Waves blockchain. Check <Link {...dapDocs}/> section
                </div>
            </div>

            <div className={styles.block}>
                <div className={styles.H3}>Examples</div>
                <div className={styles.text}>
                    IDE contains a lot of runnable Scripts, dApps and tests to help you get used to Ride language.
                    Check them in Library menu
                </div>
            </div>

            <div className={styles.block}>
                <div className={styles.H3}>Other tools</div>
                <div className={styles.text}>
                    Web IDE is just a starting point. For professional development we recommend using our offline tools.
                    Check <Link {...toolingArticle}/>
                    <div className={styles.tools_list}>
                        {links.tools.map(({title, link}, i) =>
                            <div key={i + 1} className={styles.row}>
                                {i + 1}.&nbsp;<Link link={link} title={title}/>
                            </div>)
                        }
                    </div>
                </div>
            </div>

            <div className={styles.column_block}>
                <div className={styles.column}>
                    <div className={styles.H3}>Video Tutorials</div>
                    {links.video.map(({title, link}, i) =>
                        <div key={i + 1} className={styles.row}>
                            {i + 1}.&nbsp;<Link link={link} title={title}/>
                        </div>)}
                </div>
                <div className={styles.column}>
                    <div className={styles.H3}>Hitchhiker’s Guide to Waves Smart Contracts</div>
                    {links.guides.map(({title, link}, i) =>
                        <div key={i + 1} className={styles.row}>
                            {i + 1}.&nbsp;<Link link={link} title={title}/>
                        </div>)}
                </div>
            </div>

            <div className={styles.block}>
                <div className={styles.H3}>Forum</div>

                {links.forum.map(({title, link}, i) =>
                    <div key={i + 1} className={styles.row}>
                        {i + 1}.&nbsp;<Link link={link} title={title}/>
                    </div>)}

                <div className={styles.text}>
                    This topic is for discussing your issues, requests, feedback and for announcements related to Waves
                    Ride IDE and REPL
                </div>
            </div>

        </Scrollbar>;
    }

}
