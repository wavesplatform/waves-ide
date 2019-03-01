import React, { Component, Fragment, KeyboardEvent } from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import IconButton from '@material-ui/core/IconButton/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FiberManualRecord from '@material-ui/icons/FiberManualRecordOutlined';
import CheckCircle from '@material-ui/icons/CheckCircleOutline';
import withStyles, { StyledComponentProps } from '@material-ui/core/styles/withStyles';
import { Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    buttonsContainer: {
        // border: '1px solid black',
        justifyContent: 'flex-end'
    }
});

interface IAccountSummaryProps extends StyledComponentProps<keyof ReturnType<typeof styles>>{
    label: string
    selected: boolean
    onSelect: () => void
    onDelete?: () => void
    onEdit: (label: string) => void
}

class AccountSummaryComponent extends Component<IAccountSummaryProps, { isEditing: boolean }> {
    state = {isEditing: false};

    handleEnter = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            this.setState({isEditing: false});
        }
    };

    handleFocus = (e: any) => {
        const input = (e.nativeEvent.srcElement as HTMLInputElement);
        input.setSelectionRange(0, input.value.length);
    };

    handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({isEditing: true});
    };

    handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const {onDelete} = this.props;
        if (onDelete) onDelete();
    };

    handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect();
    };

    render() {
        const {classes, label, selected, onDelete, onEdit} = this.props;
        const {isEditing} = this.state;
        return (
            <Fragment>
                {isEditing
                    ?
                    <input onChange={(e) => {
                        onEdit(e.target.value);
                    }}
                           readOnly={false}
                           onFocus={this.handleFocus}
                           value={label}
                           autoFocus={true}
                           onBlur={() => this.setState({isEditing: false})}
                           onKeyDown={this.handleEnter}/>
                    :
                    <div className={classes!.root}>
                        <IconButton
                            onClick={this.handleSelect}
                            component="div">
                            {selected ? <CheckCircle/> : <FiberManualRecord/>}
                        </IconButton>
                        <Typography>{label}</Typography>
                        <span className={classes!.buttonsContainer}>
                            <IconButton
                                onClick={this.handleEditClick}
                                component="span">
                                <EditIcon/>
                            </IconButton>
                            {onDelete &&
                            <IconButton
                                onClick={this.handleDeleteClick}
                                component="div">
                                <DeleteIcon/>
                            </IconButton>}
                        </span>
                    </div>
                }
            </Fragment>
        );
    }
}

export default withStyles(styles)(AccountSummaryComponent);
