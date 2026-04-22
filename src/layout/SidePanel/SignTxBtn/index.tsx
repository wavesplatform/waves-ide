import React from 'react';
import styles from './styles.less';
import SignerStore from '@stores/SignerStore';
import { inject } from 'mobx-react';
import { IRouteComponentProps, withRouter } from '@utils/withRouter';

export interface ISignTxBtnProps extends IRouteComponentProps {
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
        return <div className={styles.root} onClick={this.handleClick} title="Open transaction signing tool"/>;
    }
}

export default withRouter(SignTxBtn);
