import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

export default withRouter(({history}: RouteComponentProps) =>
    <div onClick={() => history.push('/settings')} className={'settings-24-basic-600'}/>
);
