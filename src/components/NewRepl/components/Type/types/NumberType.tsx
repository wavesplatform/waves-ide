import  React from 'react';

interface INumberTypeProps {
    value: number
}

export class NumberType extends React.Component<INumberTypeProps> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const {value} = this.props;
        return <div className = "type number" > {value} </div>;
    }
}
