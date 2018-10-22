import React, {Component, ChangeEvent, ReactNode} from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from "@material-ui/core/Typography/Typography";
import {SyntaxTreeTab} from "./syntaxTreeTab";
import {BinaryTab} from "./binaryTab";


const TabContainer = (props:{children: ReactNode}) => {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
};

export class RightTabs extends Component<{}, { value: string }> {
    state = {
        value: "syntax-tree"
    }

    handleChange = (event:ChangeEvent, value: string) => {
        this.setState({value});
    };

    render() {
        const {value} = this.state;

        return (
            <div>
                <Tabs value={value}
                      onChange={this.handleChange}
                      centered
                      fullWidth
                      indicatorColor="primary"
                   >
                    <Tab value="syntax-tree"
                         label='Syntax tree'
                         style={{backgroundColor: '#f8f9fb', color: '#4e5c6e', textTransform: 'none'}}
                    />
                    <Tab value="binary"
                         label='Binary'
                         style={{backgroundColor: '#f8f9fb', color: '#4e5c6e', textTransform: 'none'}}
                    />
                </Tabs>
                {value === 'syntax-tree' && <TabContainer children={<SyntaxTreeTab/>}/>}
                {value === 'binary' && <TabContainer children={<BinaryTab/>}/>}
            </div>
        )
    }
}