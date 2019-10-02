import * as React from 'react';
import styles from './styles.less';

export interface ISettingsProps {
    info?: JSX.Element
    onChange: (val: string) => void
    value: string
    title: string
}

export const Setting = (props: ISettingsProps) => (
    <div className={styles.root}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.input_info_container}>
            <input
                className={styles.input}
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
            />
            {props.info}
        </div>
    </div>
);

export default Setting;
