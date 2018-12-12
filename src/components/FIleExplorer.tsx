import * as React from "react"
import {connect, Dispatch} from "react-redux"
import {RootState} from "../store";
import {StyledComponentProps, Theme} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme: Theme) => ({
    root: {

    }
});

const mapStateToProps = (state: RootState) => ({

});

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => ({

});

interface IFileExplorerProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    StyledComponentProps<keyof ReturnType<typeof styles>>
{

}

interface IFileExplorerState {

}

class IFileExplorer extends React.Component<IFileExplorerProps, IFileExplorerState> {

    render() {
        return <div></div>
    }
}


export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(IFileExplorer))



