import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

interface IProps {
    value: boolean
}

export class BooleanType extends React.Component<IProps> {

    render() {
        return <div className={cn(styles.bool, styles.type)}>{this.props.value ? 'true' : 'false'}</div>;
    }
}
