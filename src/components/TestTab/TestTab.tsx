import React from "react";

import Button from '@material-ui/core/Button';

import {IProps, IState} from './types';

class TestTab extends React.Component<IProps, IState> {
    public state: IState = {
    };

    public render() {
        const {classes} = this.props;

        return (
            <div className={classes!.testTab}>
                <div className="testTab_results">
                </div>

                <Button
                    variant="contained"
                    fullWidth
                    children={}
                    color="primary"
                    onClick={() => this.handleDeploy(base64, file)}
                />
            </div>
        );
    };
};

export default TestTab;
