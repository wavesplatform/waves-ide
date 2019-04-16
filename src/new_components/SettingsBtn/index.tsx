import React from 'react';
import classNames from 'classnames';
import { RouteComponentProps, withRouter } from 'react-router';

interface IProps extends RouteComponentProps {
    className?: string,
}

class SettingsBtn extends React.Component<IProps> {
    render(): React.ReactNode {
        const {history, className} = this.props;
        return <div
            onClick={() => history.push('/settings')}
            className={classNames('settings-24-basic-600', className)}
        />;
    }
}

export default withRouter(SettingsBtn);

