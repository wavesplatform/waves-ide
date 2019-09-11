import React from 'react';

interface IProps {
    value: any
}

export class BooleanType extends React.Component<IProps> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        const {value} = this.props;
        return <div className="bool type">{value ? 'true' : 'false'}</div>;
    }
}
