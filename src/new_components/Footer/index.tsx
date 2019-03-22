import React from 'react';

import styles from './styles.less';

class Footer extends React.Component {
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.left}>
                    <a className={styles.link} target="_blank" href="/">Demotour</a>
                    <a className={styles.link} target="_blank" href="/">Hotkeys</a>
                    <a className={styles.link} target="_blank"
                       href="https://docs.wavesplatform.com/en/smart-contracts/waves-contracts-language-description.html">
                        Docs
                    </a>
                    <a className={styles.link} target="_blank" href="/">Community</a>
                </div>
                <div className={styles.right}>
                    <a className={styles.link} target="_blank" href="https://github.com/wavesplatform/waves-ide">
                        Waves IDE on GitHub
                    </a>
                </div>
            </div>
        );
    }
};

export default Footer;
