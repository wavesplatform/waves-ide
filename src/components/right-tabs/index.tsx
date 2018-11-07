import React, {Component, ChangeEvent, ReactNode} from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from "@material-ui/core/Typography/Typography";
import {SyntaxTreeTab} from "./syntaxTreeTab";
import {BinaryTab} from "./binaryTab";
import {AccountsTab} from "./accountsTab"
import {Theme} from "@material-ui/core/styles";
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

class RightTabsComponent extends Component<{classes:any}, { value: string }> {
    state = {
        value: "syntax-tree"
    }

    handleChange = (event: ChangeEvent, value: string) => {
        this.setState({value});
    };

    render() {
        const {value} = this.state;
        const {classes} = this.props;

        const activeTab = ({
            accounts: <AccountsTab/>,
            'syntax-tree': <SyntaxTreeTab/>,
            binary: <BinaryTab/>
        } as any)[value];

        return (
            <div className={classes.root}>
                <Tabs value={value}
                      onChange={this.handleChange}
                      centered
                      fullWidth
                      indicatorColor="primary"
                >
                    <Tab
                        value={"accounts"}
                        label={"Accounts"}
                        className={classes.tabButton}
                    />
                    <Tab value="syntax-tree"
                         label='Syntax tree'
                         className={classes.tabButton}
                    />
                    <Tab value="binary"
                         label='Binary'
                         className={classes.tabButton}
                    />
                </Tabs>
                <TabContainer containerClass={classes.tabContainer} children={activeTab}/>}
            </div>
        )
    }
}

export const RightTabs = withStyles(styles)(RightTabsComponent)