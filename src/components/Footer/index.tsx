import React from 'react';

import styles from './styles.less';
import { inject, observer } from 'mobx-react';
import { TAB_TYPE, TabsStore } from "@stores";

const links = {
    Demotour: '',
    Docs: 'https://docs.wavesplatform.com/en/smart-contracts/writing-dapps.html',
    ['Env doc']: 'http://wavesplatform.github.io/js-test-env',
    Community: '',
    git: 'https://github.com/wavesplatform/waves-ide'
};

interface IInjectedProps{
    tabsStore?: TabsStore
}

@inject('tabsStore')
class Footer extends React.Component<IInjectedProps> {

    openHotKeysPage = () => {
        const tabsStore = this.props.tabsStore!;
        const index = tabsStore.tabs.findIndex(tab => tab.type === TAB_TYPE.HOTKEYS);
        if (index === -1) tabsStore.addTab({type: TAB_TYPE.HOTKEYS});
        else tabsStore.selectTab(index);
    };


    render() {
        return (
            <div className={styles.root}>
                <div className={styles.content}>
                    <div>
                        {Object.entries(links).filter(([name, link]) => name !== 'git' && link !== '')
                            .map(([name, link]) =>
                                <a className={styles.link} target="_blank" href={link} key={name}>{name}</a>)
                        }
                                <a className={styles.link} onClick={this.openHotKeysPage} >Hotkeys</a>
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
