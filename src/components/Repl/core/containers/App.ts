import { connect } from 'react-redux';
import { App as AppComponent } from '../components/App';
import { setTheme, setLayout } from '../actions/Settings';
import { setEnv } from '../actions/Env';

const mapStateToProps = ({ settings }: any, props: any) => ({
    theme: settings.theme,
    readOnly: props.readOnly,
    layout: settings.layout,
    consoleRef: props.consoleRef
});

const mapDispatchToProps = () => ({
    setTheme,
    setLayout,
    setEnv
});

export const App = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppComponent);
