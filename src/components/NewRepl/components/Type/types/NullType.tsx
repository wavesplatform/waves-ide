import  React from 'react';

export class NullType extends React.Component<any> {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return <div className="type null">null</div>;
    }
}

