import React, { createRef } from 'react';
import classNames from 'classnames';
import Dialog from '@src/new_components/Dialog';
import Button from '@src/new_components/Button';
import styles from './styles.less';

interface IProps {
    visible: boolean
    handleClose: () => void
    handleImport: (name: string, seed: string) => void
}

export default class ImportDialog extends React.Component<IProps> {
    seedRef = createRef<HTMLTextAreaElement>();

    nameRef = createRef<HTMLInputElement>();


    render() {
        const {visible, handleClose, handleImport} = this.props;
        return <Dialog
            title="Import account"
            onClose={handleClose}
            width={618}
            visible={visible}
            footer={<>
                <Button className={styles.dialog_btn} onClick={handleClose}>Delete</Button>
                <Button
                    className={styles.dialog_btn}
                    type="action-blue"
                    disabled={this.seedRef.current == null
                    || this.nameRef.current == null
                    || this.seedRef.current!.value === ''
                    || this.nameRef.current!.value === ''
                    }
                    onClick={() => handleImport(this.nameRef.current!.value, this.seedRef.current!.value)}
                >Import</Button>
            </>}
        >
            <div className={styles.dialog}>
                <div className={styles.dialog_field}>
                    <div className={styles.dialog_label}>Your wallet seed phrase</div>
                    <textarea
                        ref={this.seedRef}
                        className={classNames(
                            styles.dialog_input,
                            (this.seedRef.current && this.seedRef.current!.value === '') && styles.dialog_input_error
                        )}
                    />
                </div>
                <div className={styles.dialog_field}>
                    <div className={styles.dialog_label}>Name your account (it will be shown in IDE)</div>
                    <input
                        ref={this.nameRef}
                        className={classNames(
                            styles.dialog_input,
                            styles.dialog_inputName,
                            (this.nameRef.current && this.nameRef.current!.value === '') && styles.dialog_input_error
                        )}
                    />
                </div>
            </div>
        </Dialog>;
    }
}
