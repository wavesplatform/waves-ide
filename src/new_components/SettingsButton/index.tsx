import { RouteComponentProps, withRouter } from 'react-router';
import * as React from 'react';
import icons from '../icons';

export default withRouter(({history}: RouteComponentProps) => (
    <div onClick={() => {
        history.push('/settings');
    }}>
        {icons.setting}
    </div>
))
