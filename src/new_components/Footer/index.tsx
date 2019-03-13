import React from 'react';
import withStyles, { StyledComponentProps } from '@material-ui/core/styles/withStyles';

const styles = () => ({
    root: {
        backgroundColor: '#f8f9fb',
        padding: '12px 24px',
        fontSize: '13px'
    },
    link: {
        marginRight: '45px',
        textDecoration: 'none',
        color: '#949EAC'
    },
    left: {
        float: 'left'
    },
    right: {
        float: 'right'
    }

});

interface IFooterProps extends StyledComponentProps<keyof ReturnType<typeof styles>> {
}

class FooterComponent extends React.Component<IFooterProps> {

    render() {
        const {classes} = this.props;
        return <div className={classes!.root}>
            <div className={classes!.left}>
                <a className={classes!.link} target="_blank" href="/">Demotour</a>
                <a className={classes!.link} target="_blank" href="/">Hotkeys</a>
                <a className={classes!.link} target="_blank"
                   href="https://docs.wavesplatform.com/en/smart-contracts/waves-contracts-language-description.html">Docs</a>
                <a className={classes!.link} target="_blank" href="/">Community</a>
            </div>
            <div className={classes!.right}>
                <a className={classes!.link} target="_blank" href="https://github.com/wavesplatform/waves-ide">Waves IDE
                    on GitHub</a>
            </div>
        </div>;
    }
}

export default withStyles(styles as any)(FooterComponent);
