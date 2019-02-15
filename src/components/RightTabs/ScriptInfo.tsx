import * as React from "react";
import {RootAction, RootState} from "../../store";
import {connect, Dispatch} from "react-redux";
import {StyledComponentProps, Theme} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
    root: {}
});

const mapStateToProps = (state: RootState) => ({
    apiBase: state.settings.apiBase
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({})

interface IScriptInfoProps extends StyledComponentProps<keyof ReturnType<typeof styles>>,
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {
    base64: string
}

interface IScriptInfoState {
    prevBase64: string
    resp: any
}

class ScriptInfo extends React.Component<IScriptInfoProps, IScriptInfoState> {
    state = {
        prevBase64: '',
        resp: null
    };

    private updateRequest?: Promise<any>;
    private currentBase64: string | null = null;

    static getDerivedStateFromProps(props: IScriptInfoProps, state: IScriptInfoState) {
        // Store prevBase64 in state so we can compare when props change.
        // Clear out previously-loaded data (so we don't render stale stuff).
        if (props.base64 !== state.prevBase64) {
            return {
                resp: null,
                prevBase64: props.base64,
            };
        }

        // No state update necessary
        return null;
    }

    updateScriptInfo(base64: string) {
        if (base64 === this.currentBase64) {
            // Data for this script is already loading
            return
        }

        this.currentBase64 = base64;

        const {apiBase} = this.props;

        const url = new URL('utils/script/estimate', apiBase).href;
        this.updateRequest = fetch(url, {body: base64, method: 'POST'})
            .then(resp => resp.json())
            .then(json => {
                if (base64 === this.currentBase64) {
                    this.setState(() => ({resp: json}))
                }
            })
            .catch(console.error)
    }

    componentDidMount() {
        this.updateScriptInfo(this.props.base64)
    }

    componentDidUpdate() {
        if (this.state.resp === null) {
            this.updateScriptInfo(this.props.base64);
        }
    }

    componentWillUnmount() {
        this.currentBase64 = null;
    }

    render() {
        const {resp} = this.state;
        return (
            <React.Fragment>
                <div>Script complexity: {resp != null ? (resp as any).complexity : 'unknown'}</div>
            </React.Fragment>
        )
    }
}

export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(ScriptInfo))