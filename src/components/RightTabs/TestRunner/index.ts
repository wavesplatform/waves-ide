import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { RootState } from '../../../store';

import TestRunner from './TestRunner';

import { getCurrentFile } from '../../../store/file-manager-mw';

import styles from './styles';

const getTest = (state: RootState): string | null => {
    const file = getCurrentFile(state);

    return file
        ? file.content
        : null;
};

const mapStateToProps = (state: RootState) => ({
    test: getTest(state)
});

const mapDispatchToProps = () => ({
});

export {
    mapStateToProps,
    mapDispatchToProps
};

export default withStyles(styles as any)(connect(mapStateToProps, mapDispatchToProps)(TestRunner));
