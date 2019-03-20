import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import SvgIcon from '@material-ui/core/SvgIcon';
import NewMenuButton from './NewMenuButton';
import { ToolsButton } from './ToolsButton';
import { StyledComponentProps, Theme } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import SettingsButton from './SettingsButton';
import TutorialButton from './TutorialsButton';
import LogoIcon from '../icons/Logo';
import GithubIcon from '../icons/Github';

const infoLink = 'https://docs.wavesplatform.com/en/smart-contracts/video-tutorials-and-articles.html';

const styles = (theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    left: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    right: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    }
});

export default withStyles(styles as any)(({classes}: StyledComponentProps<keyof ReturnType<typeof styles>>) => (
    <div className={classes!.root}>
        <div className={classes!.left}>
            <LogoIcon/>
            <NewMenuButton/>
            <ToolsButton/>
            <TutorialButton infoLink={infoLink} />

        </div>
        <div className={classes!.right}>
            <SettingsButton/>
            <a href="http://github.com/wavesplatform/waves-ide">
                <IconButton>
                    <GithubIcon/>
                </IconButton>
            </a>
            <div/>
        </div>
    </div>
));
