import React from 'react';

interface IProps {
    className?: string
    href?: string
    children?: React.ReactNode
}

export default class Link extends React.Component<IProps>{

    render(){
        const {href, children, className} = this.props;
        return <a target="_blank" className={className} rel="noopener, noreferrer" href={href}>{children}</a>;
    }

}
