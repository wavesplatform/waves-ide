import React from 'react';
import cn from 'classnames';
import { RouteComponentProps, withRouter } from 'react-router';
import styles from './styles.less';
interface IProps extends RouteComponentProps {
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

