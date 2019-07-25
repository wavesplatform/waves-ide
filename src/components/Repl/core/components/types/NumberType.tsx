import * as React from 'react';

interface INumberTypeProps {
    value: number
}

export class NumberType extends React.Component<any> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const {value} = this.props;
        return <div className = "type number" > {value} </div>;
    }
}
