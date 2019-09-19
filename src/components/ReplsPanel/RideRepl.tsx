import React from "react";
import { repl } from "@waves/ride-js";

export default class RideRepl extends React.Component {


    repl: any = null
    eval: any = null

    componentDidMount(): void {
        this.repl = repl();
        this.eval = repl().evaluate;
    }

    render(){
        return <div></div>
    }
}
