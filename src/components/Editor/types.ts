import { FilesStore } from '@stores';

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
