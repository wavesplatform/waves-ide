import {mapStateToProps, mapDispatchToProps} from './index';

interface IState {};

interface IProps extends 
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {};

export {
    IProps,
    IState
};
