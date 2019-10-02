import React from 'react';
import which from '../which-type';
import { ITypeState } from './ITypeState';
import cn from 'classnames';
import styles from './styles.less';


interface IEntryTypeProps {
    allowOpen: boolean,
    value: [string, any],
    shallow?: boolean
}

export class EntryType extends React.Component<IEntryTypeProps, ITypeState> {

    state = {open: false};

    toggle = (e: React.MouseEvent) => {
        if (!this.props.allowOpen) return;
        e.stopPropagation();
        e.preventDefault();
        this.setState({open: !this.state.open});
    };

    render() {
        const entry = this.props.value;
        const {open} = this.state;
        const [key, value] = entry;
        const Key = which(key);
        const Value = which(value);

        return (!open)
            ? (
                <div onClick={this.toggle} className={cn(styles.type, styles.closed)}>
                    <div className={styles['key-value']}>
                        <span className={styles.key}><Key allowOpen={open} value={key}/></span>
                        <span className={styles.arbInfo}>=> </span>
                        <span><Value allowOpen={open} value={value}/></span>
                    </div>
                </div>
            ) : (
                <div onClick={this.toggle} className={styles.type}>
                    <span>{'{'}</span>
                    <div className={styles.group}>
                        <div className={styles['key-value']}>
                            <span className={styles.key}>key:</span>
                            <span><Key allowOpen={open} value={key}/></span>
                        </div>
                        <div className={styles['key-value']}>
                            <span className={styles.key}>value:</span>
                            <span><Value allowOpen={open} value={value}/></span>
                        </div>
                    </div>
                    <span>{'}'}</span>
                </div>
            );
    }
}
