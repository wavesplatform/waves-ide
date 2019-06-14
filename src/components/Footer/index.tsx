import React from 'react';

import styles from './styles.less';

const links = {
    Demotour: '',
    Hotkeys: '',
    Docs: 'https://docs.wavesplatform.com/en/smart-contracts/writing-dapps.html',
    ['Env doc']: 'http://wavesplatform.github.io/js-test-env',
    Community: '',
    git: 'https://github.com/wavesplatform/waves-ide'
};

class Footer extends React.Component {
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.content}>
                    <div>
                        {Object.entries(links).filter(([name, link]) => name !== 'git' && link !== '')
                            .map(([name, link]) =>
                                <a className={styles.link} target="_blank" href={link} key={name}>{name}</a>)
                        }
                    </div>
                    <div>
                        <a className={styles.link} target="_blank" href={links.git}>Waves IDE on GitHub</a>
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
