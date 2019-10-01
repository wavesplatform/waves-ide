import * as React from 'react';
import styles from './styles.less';
import cn from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
interface IProps {
    value: string
}

export class LineMenu extends React.Component<IProps> {
    handleCopy = (str: string) => () => copyToClipboard(str);

    render() {
        const {value} = this.props;
        return (
            <div className={styles.LineNav}>
                <button className={cn(styles.icon, styles.copy)} onClick={this.handleCopy(JSON.stringify(value))}>copy</button>
            </div>
        );
    }
}
