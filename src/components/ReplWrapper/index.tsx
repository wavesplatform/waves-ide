import {connect}    from "react-redux";
import {withStyles} from '@material-ui/core/styles';

import Component from "./Component";

import styles from './styles';

const mapStateToProps = () => ({
});

const mapDispatchToProps = () => ({
});

export {
    mapStateToProps,
    mapDispatchToProps
};

export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(Component));
