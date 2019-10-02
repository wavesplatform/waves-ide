import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface IProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    value: string
    invalid?: boolean
    disabled?: boolean
    className?: string
}

export default class Input extends React.Component<IProps> {

    render() {
        const {onChange, value, invalid, disabled, className} = this.props;
        return <input
            onChange={onChange}
            value={value}
            className={cn(styles.root, className, {[styles.invalid]: invalid})}
            disabled={disabled}
        />;
    }
}
