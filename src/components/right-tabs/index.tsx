import * as React from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {SyntaxTreeTab} from "./syntaxTreeTab";
import {BinaryTab} from "./binaryTab";
import Typography from "@material-ui/core/Typography/Typography";


const TabContainer = (props:{children: React.ReactNode}) => {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

export class RightTabs extends React.Component<{}, { value: string }> {
    constructor(props) {
        super(props);
        this.state = {
            value: "syntax-tree"
        }
    }

    handleChange = (event, value) => {
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