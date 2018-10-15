import * as React from "react"
import Snackbar from '@material-ui/core/Snackbar';
import {connect} from "react-redux"
import {store} from "../store"
import {notifyUser} from "../actions";
import {IAppState} from '../state'

class userNotification extends React.Component<{ text: string }> {
    constructor(props) {
        console.log('userNotification')
        super(props)
    }

    render() {
        return <Snackbar
            open={this.props.text.length > 0}
            message={this.props.text}
            autoHideDuration={4000}
            onClose={() => {
                store.dispatch(notifyUser(''))
            }}/>
    }
}

export const UserNotification = connect((state: IAppState) => ({text: state.snackMessage}))(userNotification)