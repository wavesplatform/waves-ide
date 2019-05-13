import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface IProps extends RouteComponentProps {
    className?: string,
}

class SettingsBtn extends React.Component<IProps> {
    render(): React.ReactNode {
        const {history, className} = this.props;
        return (
            <div className={className}
                 onClick={() => history.push('/settings')}>
                <div className={'settings-24-basic-600'}/>
            </div>);

    }
}

export default withRouter(SettingsBtn);

