import React from 'react';
import cn from 'classnames';
import styles from './styles.less';

export class UndefinedType extends React.Component {

    render() {
        return <div className={cn(styles.type, styles.undefined)}>undefined</div>;
    }
}
