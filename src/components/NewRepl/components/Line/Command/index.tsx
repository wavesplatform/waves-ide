import React from 'react';
import { LineMenu } from '@components/NewRepl/components/Line/LineMenu';
import styles from '../styles.less';
import cn from 'classnames';

interface IProps {
    value: any
}

export default class Command extends React.Component<IProps> {

    render() {
        const {value} = this.props;
        return <div className={cn(styles.prompt, styles.input)}><LineMenu value={value}/>{value}</div>;
    }
}
