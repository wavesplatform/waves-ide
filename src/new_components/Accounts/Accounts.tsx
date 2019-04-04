import React from 'react';
import classNames from 'classnames';
import styles from './styles.less';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Popover from 'rc-tooltip';
import { copyToClipboard } from '@utils/copyToClipboard';
import notification from 'rc-notification';

type TNotification = { notice: (arg0: { content: string; }) => void; };


export default class Accounts extends React.Component<{ className: string }> {

    state = {
        isOpen: true
    };

    handleCopy = (data: string) => {
        if (copyToClipboard(data)) {
            notification.newInstance({}, (notification: TNotification) => {
                notification.notice({content: 'Copied!'});
            });
        }
    };

    private getCopyButton = (data: string) =>
        <div onClick={() => this.handleCopy(data)} className={styles.body_copyButton}/>;

    private getButtons = (key: string, name: string) =>
        <div className={styles.toolButtons}>
            <Popover placement="bottom" overlay={<p>Rename</p>} trigger="hover">
                <div className="edit-12-basic-600"
                    // onClick={() => this.setState({editingTab: key})}
                />
            </Popover>
            <Popover
                trigger="click"
                placement="bottom"
                overlay={
                    <div>
                        <p>Are you sure you want to delete&nbsp;<b>{name}</b>&nbsp;?</p>
                        <button className={styles.deleteButton}
                            // onClick={() => this.props.filesStore!.deleteFile(key)}
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="delete-12-basic-600"/>
            </Popover>
        </div>;

    private getAccountInfo = () => <div className={styles.body_infoItems}>
        <div className={styles.body_infoItem}>
            <div className={styles.body_infoTitle}>Address{this.getCopyButton('')}</div>
            {'ncxvjhbcjakscvhjasbclabsjckasblcbaskjcbasj'}
        </div>
        <div className={styles.body_infoItem}>
            <div className={styles.body_infoTitle}>Public key{this.getCopyButton('')}</div>
            {'ncxvjhbcjakscvhjasbclabsjckasblcbaskjcbasj'}
        </div>
        <div className={styles.body_infoItem}>
            <div className={styles.body_infoTitle}>Private key{this.getCopyButton('')}</div>
            {'ncxvjhbcjakscvhjasbclabsjckasblcbaskjcbasj'}
        </div>
        <div className={styles.body_infoItem}>
            <div className={styles.body_infoTitle}>Seed{this.getCopyButton('')}</div>
            <textarea rows={4} className={styles.body_seed} spellCheck={false}
                      defaultValue={'Lorem ipsum dolor sit amet consectetur ' +
                      'adipisicing elit Aliquid commodi doloremque fuga iusto'}
            />
        </div>
    </div>;

    render() {
        const {isOpen} = this.state;

        return <div className={classNames(styles.root, this.props.className)}>
            <div className={styles.head}>
                <div className={styles.head_info}>
                    <div className={styles.head_avatar}/>
                    <div className={styles.head_textContainer}>
                        <div className={styles.head_name}>
                            {'Account 1'}
                        </div>
                        <div className={styles.head_status}>
                            <div className={styles.head_indicator}/>
                            {'Active'}
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => this.setState({isOpen: !isOpen})}
                    className={isOpen ? styles.head_arrow_open : styles.head_arrow}
                />
            </div>
            {isOpen &&
            <div className={styles.body}>
                <PerfectScrollbar option={{suppressScrollX: true}}>
                    {this.getAccountInfo()}
                    {[{name: 'Account 1', active: true}, {name: 'Account 2'}, {name: 'Account 3'}]
                        .map((account, i) =>
                            <div key={i} className={styles.body_accountItem}>
                                {account.active ? <div>✅</div> : <div>⏹</div>}
                                <div className={styles.body_avatar}/>
                                <div className={styles.name}>{account.name}</div>
                                {this.getButtons(name, name)}
                            </div>
                        )
                    }
                </PerfectScrollbar>
                <div className={styles.body_actions}>
                    <div className={styles.body_addAccount}/>
                    Generate new action
                </div>
            </div>
            }
        </div>;
    }

}
