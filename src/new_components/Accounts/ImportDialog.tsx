import React from 'react';
import classNames from 'classnames';
import Dialog from '@src/new_components/Dialog';
import Button from '@src/new_components/Button';
import styles from './styles.less';

interface IProps {
    visible: boolean
    onClose: () => void
    onImport: (name: string, seed: string) => void
}

interface IState {
    seed: string
    seedInit: boolean
    name: string
    nameInit: boolean
}

export default class ImportDialog extends React.Component<IProps, IState> {
    state = {
        seed: '',
        seedInit: false,
        name: '',
        nameInit: false
    };

    resetState = () => {
        this.setState({
            seed: '',
            seedInit: false,
            name: '',
            nameInit: false
        });
    };

    handleClose = () => {
        this.resetState();
        this.props.onClose();
    };

    handleImport = () => {
        this.props.onImport(this.state.name, this.state.seed);
        this.handleClose();
    };

    render() {
        const {visible} = this.props;

        const {seedInit, nameInit, seed, name} = this.state;

        const isSeedValid = this.state.seed !== '';
        const isNameValid = this.state.name !== '';

        return <Dialog
            title="Import account"
            onClose={this.handleClose}
            width={618}
            visible={visible}
            footer={<>
                <Button className={styles.dialog_btn} onClick={this.handleClose}>Cancel</Button>
                <Button
                    className={styles.dialog_btn}
                    type="action-blue"
                    disabled={!isNameValid || !isSeedValid}
                    onClick={this.handleImport}
                >Import</Button>
            </>}
        >
            <div className={styles.dialog}>
                <div className={styles.dialog_field}>
                    <div className={styles.dialog_label}>Seed phrase</div>
                    <textarea
                        value={seed}
                        onBlur={() => this.setState({seedInit: true})}
                        onChange={(e) => this.setState({seed: e.target.value})}
                        className={classNames(
                            styles.dialog_input,
                            seedInit && !isSeedValid && styles.dialog_input_error
                        )}
                    />
                </div>
                <div className={styles.dialog_field}>
                    <div className={styles.dialog_label}>Account name (it will be shown in IDE)</div>
                    <input
                        value={name}
                        onBlur={() => this.setState({nameInit: true})}
                        onChange={(e) => this.setState({name: e.target.value})}
                        className={classNames(
                            styles.dialog_input,
                            styles.dialog_inputName,
                            nameInit && !isNameValid && styles.dialog_input_error
                        )}
                    />
                </div>
            </div>
        </Dialog>;
    }
}
