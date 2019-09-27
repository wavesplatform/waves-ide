import  React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface INumberTypeProps {
    value: number
}

export class NumberType extends React.Component<INumberTypeProps> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const {value} = this.props;
        return <div className={cn(styles.type, styles.number)} > {value} </div>;
    }
}
