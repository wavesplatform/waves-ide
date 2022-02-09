import React from 'react';
import { Node } from '@stores';

interface IProps {
    id: string | string[]
    node: Node | undefined,
}

export const SuccessMessage = (props: IProps) => {
    const {node, id} = props;
    const explorerLink = (node && node.explorerLink) || null;
    const makeLink = (id: string) => explorerLink ?
        <a href={`${explorerLink}/tx/${id}`} target="_blank"
           rel="noopener noreferrer">{id}</a>
        : id;

    if (Array.isArray(id)) {
        const successMessage = id.map((id, i) => <div key={i}>{makeLink(id)} — succeed<br/></div>);
        return <>{successMessage}</>;
    } else {
        return <>Tx has been sent. ID: {makeLink(id)}</>;
    }
};
