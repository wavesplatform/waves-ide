import React from 'react';

import styles from './styles.less';
import { inject } from 'mobx-react';
import { TAB_TYPE, TabsStore } from '@stores';
import Link from '@components/Link';

const links = {
    Demotour: '',
    Docs: 'https://docs.wavesplatform.com/en/smart-contracts/writing-dapps.html',
    ['Env doc']: 'http://wavesplatform.github.io/js-test-env',
    Community: '',
    git: 'https://github.com/wavesplatform/waves-ide'
};

interface IInjectedProps {
    tabsStore?: TabsStore
}

@inject('tabsStore')
class Footer extends React.Component<IInjectedProps> {

    openHotKeysPage = () => this.props.tabsStore!.openTutorialTab(TAB_TYPE.HOTKEYS);

    render() {
        return (
            <div className={styles.root}>
                <div className={styles.content}>
                    <div>
                        {Object.entries(links).filter(([name, link]) => name !== 'git' && link !== '')
                            .map(([name, link]) =>
                                <Link className={styles.link} href={link} key={name}>{name}</Link>)
                        }
                                <a className={styles.link} onClick={this.openHotKeysPage} >Hotkeys</a>
                    </div>
                    <div>
                        <Link className={styles.link} href={links.git}>Waves IDE on GitHub</Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
