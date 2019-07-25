import * as React from 'react';
import { typeChecker as tc } from '../utils';
import { TArgument, TSchemaType } from '../../schemas/buildHelp';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import '../../css/Help.css';

interface IProps {
    signatures: any[]
    className?: string
}

export default class Help extends React.Component <IProps> {

    render() {
        return <div className={this.props.className}>
            {this.props.signatures.length ? this.props.signatures.map((sig, i) =>
                <Signature sig={sig} key={i} isDoc={this.props.signatures.length === 1}/>
            ) : `${this.props.signatures}`}
        </div>;
    }
}


const Signature = ({sig, isDoc}: { sig: TSchemaType, isDoc?: boolean }) => {
    const doc = (sig.doc !== '' && isDoc) ? <div className="docStyle">{sig.doc}</div> : <></>;
    let returnType = <></>;
    if (sig.resultType.length > 0) {
        returnType = <>
            <div>:&nbsp;</div>
            <div className="flex">
                {
                    sig.resultType.map((item, i) => {
                        return item.tip != null
                            ? <Tooltip
                                key={i}
                                placement="top"
                                trigger={['hover']}
                                overlay={<pre className="tooltipText">{tc.getTypeDoc(item.val, item.tip)}</pre>}
                                destroyTooltipOnHide
                            >
                                <div className="hov">{item.val}</div>
                            </Tooltip>
                            : item.val.split(' ').map((item, i) => <div key={i}>{item}&nbsp;</div>);
                    })
                }
            </div>
        </>;
    }
    return <>
        <div className="lineStyle">
            <Tooltip placement="top" trigger={['hover']} overlay={<pre className="tooltipText">{sig.doc}</pre>}
                     destroyTooltipOnHide>
                <div className="hov">{sig.name}</div>
            </Tooltip>
            <div>&nbsp;(</div>
            {sig.args.map((a: TArgument, i: number) =>
                <Argument a={a} key={i} isLast={sig.args.length - 1 === i}/>)
            }
            <div>)</div>
            {returnType}
        </div>
        {doc}
    </>;
};


const Argument = ({a, isLast}: { a: TArgument, isLast: boolean }) =>
    <>
        {!tc.isPrimitive(a.type)
            ? <Tooltip
                placement="top"
                trigger={['hover']}
                overlay={<pre className="tooltipText">{tc.getTypeDoc(a.typeName || a.name, a.type)}</pre>}
                destroyTooltipOnHide
            >
                <div className="hov">
                    {a.name}
                    {a.optional && '?'}
                    :&nbsp;{a.typeName || tc.getTypeDoc(a.typeName || a.name, a.type)}
                </div>
            </Tooltip>
            : <div>{a.name}{a.optional && '?'}:&nbsp;{a.type}</div>}
        {!isLast && <>,&nbsp;</>}
    </>;

