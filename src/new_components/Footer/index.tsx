import React from 'react';

import styles from './styles.less';

type TRefs = ('Demotour' | 'Hotkeys' | 'Docs' | 'Community')[];

const links = {
    Demotour: '/',
    Hotkeys: '/',
    Docs: 'https://docs.wavesplatform.com/en/smart-contracts/waves-contracts-language-description.html',
    Community: '/',
    git: 'https://github.com/wavesplatform/waves-ide'
};

class Footer extends React.Component {
    render() {
        const refs: TRefs = ['Docs']; //['Demotour', 'Hotkeys', 'Docs', 'Community'];
        return (
            <div className={styles.root}>
                <div className={styles.content}>
                    <div>
                        {refs.map(item =>
                            <a className={styles.link} target="_blank" href={links[item]} key={item}>{item}</a>)
                        }
                    </div>
                    <div>
                        <a className={styles.link} target="_blank" href={links.git}>Waves IDE on GitHub</a>
                    </div>
                </div>
            </div>
        );
    }
};

export default Footer;
