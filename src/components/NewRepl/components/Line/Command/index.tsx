import React from 'react';
import { LineNav } from '@components/NewRepl/components/Line/LineNav';
import { copyToClipboard } from '@utils/copyToClipboard';
import styles from '../styles.less';
import cn from 'classnames';

interface IProps {
    value: any
}

export default class Command extends React.Component<IProps> {
    handleCopy = (str: string) => () => copyToClipboard(str);

    render() {
        const {value} = this.props;
        return <div className={cn(styles.prompt, styles.input)}><LineNav onCopy={this.handleCopy(value)}/>{value}</div>;
    }
}
