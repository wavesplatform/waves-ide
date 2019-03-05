import { StyledComponentProps } from '@material-ui/core/styles';
import { ReplsStore } from '@src/mobx-store';

import styles from './styles';

interface IState {
    height: number,
    lastHeight: number,
    isReplExpanded: boolean,
}

interface IProps extends StyledComponentProps<keyof ReturnType<typeof styles>> {
    name: string,
    theme: string,
    replsStore?: ReplsStore
}

export {
    IProps,
    IState
};
