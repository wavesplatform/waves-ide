import { FilesStore, UIStore } from '@stores';

interface IState {
}

interface IInjectedProps {
    filesStore?: FilesStore
    uiStore?: UIStore
}

interface IProps extends IInjectedProps {
}

export {
    IProps,
    IState
};
