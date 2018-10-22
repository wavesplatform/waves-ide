import * as React from "react"
import Snackbar from '@material-ui/core/Snackbar';
import {connect} from "react-redux"
import {store, RootState} from "../store"
import {userNotification} from "../store/notifications/actions";

class UserNotificationComponent extends React.Component<{ text: string }> {

    render() {
        return <Snackbar
            open={this.props.text.length > 0}
            message={this.props.text}
            autoHideDuration={4000}
            onClose={() => {
                store.dispatch(userNotification(''))
            }}/>
    }
}

export const UserNotification = connect((state: RootState) => ({text: state.snackMessage}))(UserNotificationComponent)