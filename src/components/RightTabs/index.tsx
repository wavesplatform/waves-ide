import React, {Component, ChangeEvent, ReactNode} from 'react'
import classNames from 'classnames';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from "@material-ui/core/Typography/Typography";
import BinaryTab from "./BinaryTab";
import {AccountsTab} from "./AccountsTab"
import {StyledComponentProps, Theme} from "@material-ui/core/styles";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme:Theme): any => ({
    root: {
        width: '100%',
        height: '100%'
    },
    tabContainer: {
        padding: 0, height:'calc(100% - 48px)',
        overflow: 'auto'
    },
    tabButton: {
        backgroundColor: '#f8f9fb',
        color: '#4e5c6e',
        textTransform: 'none'
    }
});
const TabContainer = (props: { children: ReactNode, containerClass?:string }) => {
    return (
        <Typography component="div" className={props.containerClass} >
            {props.children}
        </Typography>
    );
};

interface IRightTabsComponentProps extends StyledComponentProps<ReturnType<typeof styles>> {
    className?: string
}

class RightTabsComponent extends Component<IRightTabsComponentProps, { value: string }> {
    state = {
        value: 'binary'
    }

    handleChange = (event: ChangeEvent, value: string) => {
        this.setState({value});
    };

    render() {
        const {value} = this.state;
        const {classes, className: classNameProp} = this.props;

        const activeTab = ({
            accounts: <AccountsTab/>,
            binary: <BinaryTab/>
        } as any)[value];

        const className = classNames(classes!.root, classNameProp);

        return (
            <div className={className}>
                <Tabs value={value}
                      onChange={this.handleChange}
                      centered
                      fullWidth
                      indicatorColor="primary"
                >
                    <Tab
                        value={"accounts"}
                        label={"Accounts"}
                        className={classes!.tabButton}
                    />
                    <Tab value="binary"
                         label='Binary'
                         className={classes!.tabButton}
                    />
                </Tabs>
                <TabContainer containerClass={classes!.tabContainer} children={activeTab}/>
            </div>
        )
    }
}

export const RightTabs = withStyles(styles)(RightTabsComponent);