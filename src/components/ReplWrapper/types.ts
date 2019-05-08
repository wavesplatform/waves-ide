import { StyledComponentProps } from '@material-ui/core/styles';
import { ReplsStore } from '@stores';

import styles from './styles';

interface IState {}

interface IProps extends StyledComponentProps<keyof ReturnType<typeof styles>> {
    name: string,
    theme: string,
    replsStore?: ReplsStore
}

export {
    IProps,
    IState
};
