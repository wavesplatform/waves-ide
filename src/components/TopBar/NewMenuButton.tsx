import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import EMenuItem from '../lib/ExtendedMenuItem';
import { StyledComponentProps, Theme } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import AddIcon from '@material-ui/icons/Add';
import { FilesStore, TabsStore, FILE_TYPE } from '@stores';
import { testSamples } from '@src/testSamples';

interface IExampleType {
    name: string,
    dir: string
    content: string
}
const examples: Record<string, IExampleType[]> = require('../../gitExamples.json');

const styles = (theme: Theme) => ({
    root: {
        minWidth: 90,
        color: 'white',
        marginLeft: 30
    },
    itemIcon: {
        color: '#757575',
        marginRight: 24
    }
});




interface IInjectedProps {
    filesStore?: FilesStore
    tabsStore?: TabsStore
}

interface INewMenuButtonProps extends StyledComponentProps<keyof ReturnType<typeof styles>>, IInjectedProps {

}

interface INewMenuButtonState {
    anchorEl: any
}

@inject('filesStore', 'tabsStore')
@observer
class NewMenuButton extends React.Component<INewMenuButtonProps, INewMenuButtonState> {

    public state = {
        anchorEl: null
    };

    handleClick = (event: React.MouseEvent<{}>) => {
        //event.preventDefault();
        this.setState({anchorEl: event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };

    handleLoadExample = (type: string, name: string, content: string) => {
        const mapOfTypes: Record<string, FILE_TYPE> = {
            'smart-assets': FILE_TYPE.ASSET_SCRIPT,
            'smart-accounts': FILE_TYPE.ACCOUNT_SCRIPT
        };

        this.handleClose();
        this.props.filesStore!.createFile({type: mapOfTypes[type], name, content}, true);
    };

    newEmptyFile = (type: FILE_TYPE) => {
        this.handleClose();
        this.props.filesStore!.createFile({type, content: ''}, true);
    };

    getCategories(type: string) {
        return examples[type].map((item, index: number) =>
            (<MenuItem
                children={item.name}
                key={index}
                onClick={() => this.handleLoadExample(type, item.name, item.content)}
            />)
        );
    }

    render() {
        const {classes} = this.props;
        const {anchorEl} = this.state;

        return (
            <React.Fragment>
                <Button
                    className={classes!.root}
                    //inline backgroundColor disables hover
                    style={{backgroundColor: '#1f5af6'}}
                    variant="text"
                    aria-owns={anchorEl ? 'new-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    <AddIcon/>
                    New
                </Button>
                <Menu id="new-menu"
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      onClose={this.handleClose}
                      getContentAnchorEl={null}
                      anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left'
                      }}
                      transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                      }}
                >
                    <MenuItem
                        onClick={this.newEmptyFile.bind(this, FILE_TYPE.ACCOUNT_SCRIPT)}
                        style={{paddingRight: 32}}
                    >
                        <InsertDriveFileIcon className={classes!.itemIcon}/>
                        Account script
                    </MenuItem>
                    <MenuItem
                        onClick={this.newEmptyFile.bind(this, FILE_TYPE.ASSET_SCRIPT)}
                    >
                        <InsertDriveFileIcon className={classes!.itemIcon}/>
                        Asset script
                    </MenuItem>
                    <MenuItem
                        onClick={this.newEmptyFile.bind(this, FILE_TYPE.TEST)}
                    >
                        <InsertDriveFileIcon className={classes!.itemIcon}/>
                        Test script
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            this.handleClose();
                            this.props.filesStore!.createFile({type: FILE_TYPE.TEST, content: testSamples.basic}, true);
                        }}
                    >
                        <RemoveRedEyeIcon className={classes!.itemIcon}/>
                        Test script sample
                    </MenuItem>
                    <EMenuItem menuItems={this.getCategories('smart-accounts')}>
                        <RemoveRedEyeIcon className={classes!.itemIcon}/>
                        smart-accounts
                        <ArrowRightIcon style={{color: '#757575', marginLeft: 'auto'}}/>
                    </EMenuItem>
                    <EMenuItem menuItems={this.getCategories('smart-assets')}>
                        <RemoveRedEyeIcon className={classes!.itemIcon}/>
                        smart-assets
                        <ArrowRightIcon style={{color: '#757575', marginLeft: 'auto'}}/>
                    </EMenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}


export default withStyles(styles as any)(NewMenuButton);


