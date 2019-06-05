import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styles from './styles.less';
import SignerStore from '@stores/SignerStore';
import { inject } from 'mobx-react';

export interface ISignTxBtnProps extends RouteComponentProps {
    signerStore?: SignerStore
}

@inject('signerStore')
class SignTxBtn extends React.Component<ISignTxBtnProps> {
    handleClick = () => {
        const {history, signerStore} = this.props;
        signerStore!.setTxJson('');
        history.push('signer');
    };

    render() {
        return <div className={styles.root} onClick={this.handleClick}/>;
    }
}

export default withRouter(SignTxBtn);
