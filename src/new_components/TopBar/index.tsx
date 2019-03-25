import React from 'react';
import styles from './styles.less';
import icons from '../icons';
import * as monaco from "monaco-editor";
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export default () =>
    <div className={styles.root}>
        <div className={styles.iconBtn}
             // onClick={monaco.editor.trigger('actions.find')}
        >
            {icons.search}
        </div>
        <div className={styles.iconBtn}>
            {icons.fontSize}
        </div>
        <div className={styles.iconBtn}>
            {icons.bulb}
        </div>
    </div>;
