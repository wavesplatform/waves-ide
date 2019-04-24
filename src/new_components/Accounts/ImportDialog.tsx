import React from 'react';
import classNames from 'classnames';
import Dialog from '@src/new_components/Dialog';
import Button from '@src/new_components/Button';
import styles from './styles.less';

interface IProps {
    visible: boolean
    handleClose: () => void
    handleImport: (name: string, seed: string) => void
}

interface IState {
    seed: string
    name: string
}
export default class ImportDialog extends React.Component<IProps, IState> {
    state = {
        seed: '',
        name: ''
    };

    render() {
        const {visible, handleClose, handleImport} = this.props;

        const isSeedValid = this.state.seed !== '';
        const isNameValid = this.state.name !== '';

        return <Dialog
            title="Import account"
            onClose={handleClose}
            width={618}
            visible={visible}
            footer={<>
                <Button className={styles.dialog_btn} onClick={handleClose}>Cancel</Button>
                <Button
                    className={styles.dialog_btn}
                    type="action-blue"
                    disabled={!isNameValid || !isSeedValid}
                    onClick={() => handleImport(this.state.name, this.state.seed)}
                >Import</Button>
            </>}
        >
            <div className={styles.dialog}>
                <div className={styles.dialog_field}>
                    <div className={styles.dialog_label}>Seed phrase</div>
                    <textarea
                        onChange={(e) => this.setState({seed: e.target.value})}
                        className={classNames(
                            styles.dialog_input,
                            !isSeedValid && styles.dialog_input_error
                        )}
                    />
                </div>
                <div className={styles.dialog_field}>
                    <div className={styles.dialog_label}>Account name (it will be shown in IDE)</div>
                    <input
                        onChange={(e) => this.setState({name: e.target.value})}
                        className={classNames(
                            styles.dialog_input,
                            styles.dialog_inputName,
                            !isNameValid && styles.dialog_input_error
                        )}
                    />
                </div>
            </div>
        </Dialog>;
    }
}
