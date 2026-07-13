import React from 'react';
import cn from 'classnames';
import styles from './styles.less';
import { IRouteComponentProps, withRouter } from '@utils/withRouter';

interface IProps extends IRouteComponentProps {
    className?: string,
}

class SettingsBtn extends React.Component<IProps> {
    render(): React.ReactNode {
        const {history, className} = this.props;
        return (
            <div className={cn(className, styles.root)}
                 onClick={() => history.push('/settings')}>
                <div className={styles.icon}/>
            </div>);

    }
}

export default withRouter(SettingsBtn);

