import React from 'react';
import styles from './styles.less';
import Scrollbar from '@components/Scrollbar';
import { hotKeysMap } from '@components/App/hotKeys';

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
                        Object.entries(hotKeysMap).filter((val, i) => i < size)
                            .map(([key, val], i) =>
                                <div key={i} className={styles[`row${(i & 1) ? '_gray' : ''}`]}>
                                    <p>{key}</p>
                                    <Keybindings keys={val}/>
                                </div>
                            )
                    }
                </div>
                <div>
                    <div className={styles.row_title}><p>Command</p><p>Keybinding</p></div>
                    {
                        Object.entries(hotKeysMap).filter((val, i) => i >= size)
                            .map(([key, val], i) =>
                                <div key={i} className={styles[`row${(i & 1) ? '_gray' : ''}`]}>
                                    <p>{key}</p>
                                    <Keybindings keys={val}/>
                                </div>
                            )
                    }
                </div>
            </div>


        </Scrollbar>;
    }

}

const Keybindings = ({keys}: { keys: string[] }) =>
    <div className={styles.flex_row}>
        {keys.map(key => {
            if (key === 'Meta') key = '⌘';
            if (key === 'ArrowRight') key = '>';
            if (key === 'ArrowLeft') key = '<';
            return <div className={styles.key}>{key}</div>;
        })}
    </div>;


