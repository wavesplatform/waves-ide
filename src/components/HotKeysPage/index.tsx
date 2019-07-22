import React from 'react';
import styles from './styles.less';
import Scrollbar from '@components/Scrollbar';
import { hotKeysMap } from '@src';
import { keys, platforms } from '../../services/hotKeys';


interface IProps {

}

interface IState {

}

export default class HotKeysPage extends React.Component <IProps, IState> {

    render(): React.ReactNode {
        console.log(window.navigator.platform);
        const size = hotKeysMap.length / 2;
        return <Scrollbar className={styles.root} suppressScrollX={true}>
            <div className={styles.title}>Keyboard shortcuts</div>
            <div className={styles.flex_row}>
                <div className={styles.flex_col}>
                    <div className={styles.row_title}><p>Command</p><p>Keybinding</p></div>
                    {
                        hotKeysMap.filter((val, i) => i < size)
                            .map(({macKeyMap, description}, i) =>
                                <div key={i} className={styles[`row${(i & 1) ? '_gray' : ''}`]}>
                                    <p>{description}</p>
                                    <Keybindings keyMap={macKeyMap}/>
                                </div>
                            )
                    }
                </div>
                <div className={styles.flex_col}>
                    <div className={styles.row_title}><p>Command</p><p>Keybinding</p></div>
                    {
                        hotKeysMap.filter((val, i) => i >= size)
                            .map(({macKeyMap, description}, i) =>
                                <div key={i} className={styles[`row${(i & 1) ? '_gray' : ''}`]}>
                                    <p>{description}</p>
                                    <Keybindings keyMap={macKeyMap}/>
                                </div>
                            )
                    }
                </div>
            </div>


        </Scrollbar>;
    }

}

const Keybindings = ({keyMap}: { keyMap: string[] }) =>
    <div className={styles.flex_row}>
        {keyMap.map((key, i) => {
            if (key === keys.cmd) window.navigator.platform === platforms.mac ? key = '⌘' : key = 'Ctrl';
            if (key === keys.right) key = '▶︎';
            if (key === keys.left) key = '◀︎';
            if (key === keys.plus) key = '+';
            return <div key={i} className={styles.key}>{key.toUpperCase()}</div>;
        })}
    </div>;


