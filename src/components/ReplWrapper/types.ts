import {StyledComponentProps} from "@material-ui/core/styles";

import {mapStateToProps, mapDispatchToProps} from './index';

import styles from './styles';

interface IState {
    height: number,
    lastHeight: number,
    isReplExpanded: boolean
};

interface IProps extends 
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    StyledComponentProps<keyof ReturnType<typeof styles>> {};

export {
    IProps,
    IState
};
