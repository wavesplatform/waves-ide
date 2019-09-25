import * as React from 'react';
import styles from './styles.less';

interface IProps {

}

interface IState {

}

export class Input extends React.Component<IProps, IState> {

    render() {
        return <div className={styles.root}>
            <input/>
        </div>;

    }
}
