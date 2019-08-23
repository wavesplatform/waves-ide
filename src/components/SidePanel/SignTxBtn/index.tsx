import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styles from './styles.less';
import { inject } from 'mobx-react';
import { UIStore, SignerStore } from '@stores';
import classnames from 'classnames';

export interface ISignTxBtnProps extends RouteComponentProps {
    signerStore?: SignerStore,
    uiStore?: UIStore
}

@inject('signerStore', 'uiStore')
class SignTxBtn extends React.Component<ISignTxBtnProps> {
    handleClick = () => {
        const {history, signerStore} = this.props;
        signerStore!.setTxJson('');
        history.push('signer');
    };

    render() {
        const isDarkTheme = this.props.uiStore!.editorSettings.isDarkTheme;
        return <div
            className={classnames(styles.root, {[styles['root-dark']]: isDarkTheme})}
            onClick={this.handleClick}
            title="Open transaction signing tool"
        />;
    }
}

export default withRouter(SignTxBtn);
