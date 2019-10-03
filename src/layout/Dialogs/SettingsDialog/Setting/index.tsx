import * as React from 'react';
import styles from './styles.less';
import Select from '@components/Select';
import Input from "@components/Input";

export interface ISettingsProps {
    info?: JSX.Element
    onChange: (val: string) => void
    value: string
    title: string
    select?: {title: string, value: string}[]
}

export const Setting = (props: ISettingsProps) => (
    <div className={styles.root}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.input_info_container}>
            {props.select !== undefined
                ? <Select onChange={props.onChange}
                          value={props.value}
                          options={props.select}
                          className={styles.select}
                />
                : <Input
                    className={styles.input}
                    value={props.value}
                    onChange={e => props.onChange(e.target.value)}
                />}

            {props.info}
        </div>
    </div>
);

export default Setting;
