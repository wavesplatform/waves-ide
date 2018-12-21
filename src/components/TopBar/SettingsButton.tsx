import {RouteComponentProps, withRouter} from "react-router";
import Button from "@material-ui/core/Button/Button";
import Typography from "@material-ui/core/Typography/Typography";
import * as React from "react";
import SettingsIcon from "../icons/Settings"

export default withRouter(({history}: RouteComponentProps) => (
    <Button variant='text'
            onClick={() => {
                history.push('/settings')
            }}>
        <Typography children="Settings" style={{color: '#454545'}}/>
        <SettingsIcon style={{marginLeft: 5}}/>
    </Button>
))