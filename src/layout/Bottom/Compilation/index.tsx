import React from 'react';
import styles from './styles.less';
import cl from 'classnames';
import Scrollbar from '@components/Scrollbar';
import { observer } from 'mobx-react';

interface IProps {
    compilation: { type: 'error' | 'success', message: string }[]
}

interface IState {

}
@observer
export default class Compilation extends React.Component<IProps, IState> {

    render(): React.ReactNode {
        const {compilation: data} = this.props;
        return <Scrollbar className={styles.problems}>
            {data.map(({type, message}, i) =>
                <div key={i} className={cl(styles.problems_row, styles['problems_row_' + type])}>
                    <div className={cl(styles.icon, styles['icon_' + type])}/>
                    {message}
                </div>
            )}
        </Scrollbar>;
    }

}
