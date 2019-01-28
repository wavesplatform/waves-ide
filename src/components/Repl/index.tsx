import {connect}    from "react-redux";
import {withStyles} from '@material-ui/core/styles';

import Repl from "./Repl";

import styles from './styles';

const mapStateToProps = () => ({
});

const mapDispatchToProps = () => ({
});

export {
    mapStateToProps,
    mapDispatchToProps
};

export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(Repl));
