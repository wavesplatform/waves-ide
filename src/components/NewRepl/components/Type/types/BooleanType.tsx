import React from 'react';

interface IProps {
    value: boolean
}

export class BooleanType extends React.Component<IProps> {

    render() {
        const {value} = this.props;
        return <div className="bool type">{value ? 'true' : 'false'}</div>;
    }
}
