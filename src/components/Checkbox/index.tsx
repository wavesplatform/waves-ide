import React from 'react';
import styles from './styles.less';
import cn from 'classnames';

interface IProps {
    selected: boolean
    onSelect: () => void
    className?: string
}

interface IState {

}

export default class Checkbox extends React.Component<IProps, IState> {
    render() {
        const {selected, onSelect, className} = this.props;
        return selected
            ? <div className={cn(styles.accIcon__on, className)}/>
            : <div className={cn(styles.accIcon__off, className)} onClick={onSelect}/>;
    }
}
