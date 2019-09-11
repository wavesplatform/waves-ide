import * as React from 'react';
import styles from './styles.less';
import cn from 'classnames';
interface IProps {
    onCopy: () => void
}

export class LineNav extends React.Component<IProps> {

    render() {
        const {onCopy} = this.props;
        return (
            <div className={styles.LineNav}>
                <button className={cn(styles.icon, styles.copy)} onClick={onCopy}>copy</button>
            </div>
        );
    }
}
