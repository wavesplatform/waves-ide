import * as React from 'react';
import { TArgument, TSchemaType } from '../../../schemas/buildHelp';
import styles from './styles.less';
import Collapse, { Panel } from 'rc-collapse';
import cn from 'classnames';
import { getTypeDoc, isList, isPrimitive, isStruct, isUnion, TTypeDoc } from '@components/Repl/core/utils/typeChecker';

interface IProps {
    signatures: TSchemaType[]
}

export default class Help extends React.Component <IProps> {

    expandIcon = (color: 600 | 700) => ({isActive}: { isActive: boolean }) => <div
        className={cn(styles[`expandIcon${color}`], styles[`expandIcon${color}${isActive ? '_opened' : ''}`])}/>;


    render() {
        console.log(this.props.signatures.map((sig, i) => sig.resultType))
        return <div className={styles.root}>
            <Collapse expandIcon={this.expandIcon(700)}>
                {this.props.signatures.map((sig, i) =>
                    <Panel key={i} className={styles.line} header={<Signature sig={sig}/>}>
                        <Collapse expandIcon={this.expandIcon(600)}>

                            <Panel header="Arguments">
                                {sig.args.map((arg, i) => <Argument key={i} arg={arg}/>)}
                            </Panel>

                            {/*<Panel header="Return"><TypeDetail arg={sig.args}/></Panel>*/}
                        </Collapse>
                    </Panel>
                )}
            </Collapse>
        </div>;
    }
}

class Argument extends React.Component<{ arg: TArgument }> {

    render() {
        const {arg} = this.props;
        let body: JSX.Element | JSX.Element[] =
            <ArgumentBody helper={getTypeDoc(arg.type)} typeName={arg.typeName || arg.name} doc={arg.doc}/>;
        if (isUnion(arg.type)) {
            body = arg.type.map((type, i) => {
                    if (isStruct(type)) {
                        return <ArgumentBody key={i} helper={getTypeDoc(type)} typeName={type.typeName} />;
                    } else if (isPrimitive(type)) {
                        return <ArgumentBody key={i} helper={[]} typeName={type as string}/>;
                    } else if (isList(type)) {
                        return <ArgumentBody key={i} helper={[]} typeName="List"/>;
                    } else return <div/>;
                }
            );
        }
        return <div className={styles.arg}>
            {arg && <div className={styles.arg_title}>
                <div className={styles.oval}/>
                {arg.name.toUpperCase()}{arg.optional && '?'}</div>}
            {body}
        </div>;
    }

}


const ArgumentBody = ({typeName, helper, doc}: { typeName: string, helper: TTypeDoc[], doc?: string }) =>
    <div className={styles.arg_body}>
        {typeName && <div key={typeName} className={styles.arg_typenameFont}>{typeName}</div>}
        {helper.length > 0 && <div className={styles.arg_typeField}>
            {helper.map((v, i) =>
                <div className={styles.arg_typeItem} key={i}>
                    {v.name}
                    {v.name && <>:&nbsp;</>}
                    <a className={styles.arg_link} href={v.link}>{v.type}</a>
                </div>)
            }
        </div>}
        {(doc && doc !== '') && <div className={styles.docFont}>{doc}</div>}
    </div>;

const Signature = ({sig}: { sig: TSchemaType }) => <>
    <div className={styles.hov}>{sig.name}</div>
    <div>&nbsp;(</div>
    {sig.args.map((a: TArgument, i: number) =>
        <div key={i}>{a.name}{a.optional && '?'}{sig.args.length - 1 !== i && <>,&nbsp;</>}</div>
    )}
    <div>)</div>
    <div className={styles.docFont}>&nbsp;{sig.doc && sig.doc.length > 0 && '-'}&nbsp;{sig.doc}</div>
</>;
