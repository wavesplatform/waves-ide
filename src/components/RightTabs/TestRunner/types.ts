import { StyledComponentProps } from '@material-ui/core/styles';

import { mapStateToProps, mapDispatchToProps } from './index';

import styles from './styles';

interface IState {}

interface IProps extends 
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    StyledComponentProps<keyof ReturnType<typeof styles>> {
        test: string
    }

export {
    IProps,
    IState
};
