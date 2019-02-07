import * as React from "react"
// import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import {connect, Dispatch} from 'react-redux'
import {createFile} from "../../store/files/actions";
import EMenuItem from '../lib/ExtendedMenuItem'
import {codeSamples, sampleTypes} from '../../samples'
import {RootAction, RootState} from "../../store";
import {FILE_TYPE} from "../../store/files/reducer";
import {StyledComponentProps, Theme} from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";
import RemoveRedEyeIcon from "@material-ui/icons/RemoveRedEye";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import AddIcon from "@material-ui/icons/Add";
import examples from '../../utils/getGitExamples/gitExamples.js'

const styles = (theme: Theme) => ({
    root: {
        minWidth: 90,
        color: 'white',
        marginLeft: 30
    },
    itemIcon: {
        color: "#757575",
        marginRight: 24
    }
});

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
    onLoadSample: (key: sampleTypes) => dispatch(createFile({
        content: codeSamples[key],
        type: FILE_TYPE.ACCOUNT_SCRIPT
    })),
    onLoadExample: (content:any,type:any) => dispatch(createFile({
        content: content,
        type: type
    })),
    onNewFile: (type: FILE_TYPE, code?: string) => dispatch(createFile({content: code, type}))
});

const mapOfTypes:any = {
    'smart-assets': FILE_TYPE.ASSET_SCRIPT,
    'smart-accounts': FILE_TYPE.ACCOUNT_SCRIPT
};

interface NewMenuButtonProps extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    StyledComponentProps<keyof ReturnType<typeof styles>> {

}

interface NewMenuButtonState {
    anchorEl: any
}


class NewMenuButton extends React.Component<NewMenuButtonProps, NewMenuButtonState> {

    public state = {
        anchorEl: null
    };

    handleClick = (event: React.MouseEvent<{}>) => {
        //event.preventDefault();
        this.setState({anchorEl: event.currentTarget})
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };

    handleLoadSample = (key: sampleTypes) => {
        this.handleClose();
        this.props.onLoadSample(key)
    };

    handleLoadExample = (name:any,content:any,type:any) => {
        this.handleClose();
        this.props.onLoadExample(content,mapOfTypes[type])
    };

    newEmptyFile = (type: FILE_TYPE) => {
        this.handleClose();
        this.props.onNewFile(type, '')
    };

    getCategories = (type:string) => {
        let array :any= [];
        let value:any = examples();
        value = value[type]
        for(let temp in value){
            let name:any = value[temp].name;
            array.push(<MenuItem children={name} onClick={() => this.handleLoadExample(name,value[temp].content,type)}/>)
        }
        return array
    };


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
                          vertical: "bottom",
                          horizontal: "left"
                      }}
                      transformOrigin={{
                          vertical: "top",
                          horizontal: "left"
                      }}
                >
                    <MenuItem onClick={() => this.newEmptyFile(FILE_TYPE.ACCOUNT_SCRIPT)} style={{paddingRight:32}}>
                        <InsertDriveFileIcon className={classes!.itemIcon}/>
                        Account script
                    </MenuItem>
                    <MenuItem onClick={() => this.newEmptyFile(FILE_TYPE.ASSET_SCRIPT)}>
                        <InsertDriveFileIcon className={classes!.itemIcon}/>
                        Asset script
                    </MenuItem>
                    {/*<MenuItem onClick={() => this.newEmptyFile(FILE_TYPE.CONTRACT)}>*/}
                        {/*<InsertDriveFileIcon style={{color: "#757575", marginRight: 24}}/>*/}
                        {/*Contract*/}
                    {/*</MenuItem>*/}


                    <EMenuItem
                        menuItems={[
                            <MenuItem children="Simple" onClick={() => this.handleLoadSample('simple')}/>,
                            <MenuItem children="Multisig (2 of 3)" onClick={() => this.handleLoadSample('multisig')}/>,
                            <MenuItem children="Notary" onClick={() => this.handleLoadSample('notary')}/>,
                        ]}
                    >
                        <RemoveRedEyeIcon className={classes!.itemIcon}/>
                        Sample
                        <ArrowRightIcon style={{color: "#757575", marginLeft: "auto"}}/>
                    </EMenuItem>

                    <EMenuItem menuItems={[this.getCategories('smart-accounts')]}>
                        <RemoveRedEyeIcon className={classes!.itemIcon}/>
                        smart-accounts
                        <ArrowRightIcon style={{color: "#757575", marginLeft: "auto"}}/>
                    </EMenuItem>
                    <EMenuItem menuItems={[this.getCategories('smart-assets')]}>
                        <RemoveRedEyeIcon className={classes!.itemIcon}/>
                        smart-assets
                        <ArrowRightIcon style={{color: "#757575", marginLeft: "auto"}}/>
                    </EMenuItem>
                </Menu>
            </React.Fragment>
        )
    }
}


export default withStyles(styles as any)(connect(null, mapDispatchToProps)(NewMenuButton))


