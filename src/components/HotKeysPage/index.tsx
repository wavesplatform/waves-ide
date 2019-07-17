import React from 'react';
import styles from './styles.less';
import Scrollbar from '@components/Scrollbar';
import { hotKeysMap } from "@components/App/hotKeys";

interface IProps {

}

interface IState {

}

export default class HotKeysPage extends React.Component <IProps, IState> {

    render(): React.ReactNode {
        const size = Object.keys(hotKeysMap).length / 2;
        return <Scrollbar className={styles.root}>
            <div className={styles.title}>Keyboard shortcuts</div>
            <div className={styles.flex_row}>
                <div>
                    <div className={styles.row_title}><p>Command</p><p>Keybinding</p></div>
                    {

                    }
                </div>
                <div>
                    <div className={styles.row_title}><p>Command</p><p>Keybinding</p></div>
                </div>
            </div>


        </Scrollbar>;
    }

}
