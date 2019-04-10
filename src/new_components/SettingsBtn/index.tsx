import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

const SettingsBtn = (({history}: RouteComponentProps) =>
    <div onClick={() => history.push('/settings')} className={'settings-24-basic-600'}/>
);

export default withRouter(SettingsBtn);
