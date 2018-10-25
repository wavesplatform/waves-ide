import React, {ChangeEvent, Component, Fragment, KeyboardEvent} from "react";
import Typography from "@material-ui/core/Typography/Typography";
import FileCopyOutlined from '@material-ui/icons/FileCopyOutlined';
import withStyles from "@material-ui/core/styles/withStyles";
import {IconButton, Theme} from "@material-ui/core";
import {privateKey, publicKey, address} from 'waves-crypto';
import {connect, Dispatch} from "react-redux";
import {RootAction, RootState} from "../../store";
import {userNotification} from '../../store/notifications/actions';
import TextField from "@material-ui/core/TextField/TextField";
import {copyToClipboard} from '../../utils/copyToClipboard';

const styles = (theme: Theme): any => ({
    root: {
        width: '100%'
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        fontWeight: 'bold',
        flexShrink: 0,
    },
    fieldContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
       // border: '1px solid black',
        alignItems: 'center'
    },
    field: {
        width: '80%',
        overflowX: 'hidden',
        textOverflow: 'ellipsis'
    }
});

interface IAccountDetailsProps {
    classes: any
    seed: string
    chainId: string
    onSeedChange: (seed: string) => void
    notifyUser: (msg:string) => any
}


const accountDetails = ({classes, seed, chainId, notifyUser, onSeedChange}: IAccountDetailsProps) => {
    const config = {
        'Address': address(seed, chainId),
        'Public Key': publicKey(seed),
        'Private Key': privateKey(seed),
        'Seed': seed

    };
    debugger
    return <div className={classes.root}>
        {Object.entries(config).map(([title, value], index) => (
            <Fragment key={index}>
                <Typography className={classes.heading}>{title}</Typography>
                <div className={classes.fieldContainer}>
                    {title === 'Seed' ?
                        <TextField
                            rowsMax={4}
                            className={classes.field}
                            fullWidth
                            multiline
                            onChange={(e) => onSeedChange(e.target.value)}
                            value={value}
                        />
                        :
                        <Typography className={classes.field}>{value}</Typography>
                    }
                    <IconButton onClick={() => {
                        copyToClipboard(value);
                        notifyUser(`${title} copied!`)
                    }}>
                        <FileCopyOutlined/>
                    </IconButton>
                </div>
                <br/>
            </Fragment>
        ))}
    </div>
};

const mapStateToProps = (state: RootState) => ({chainId: state.settings.chainId});
const mapDispatchToProps = (dispatch:Dispatch<RootAction>) => ({
    notifyUser: (msg: string) => dispatch(userNotification(msg))
});
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(accountDetails))