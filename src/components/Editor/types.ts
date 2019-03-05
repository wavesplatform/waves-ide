import { FilesStore } from '@src/mobx-store';

interface IState {
}

interface IInjectedProps {
    filesStore?: FilesStore
}

interface IProps extends IInjectedProps {
}

export {
    IProps,
    IState
};
