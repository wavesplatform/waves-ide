import React from 'react';
import styles from './styles.less';
import notification from 'rc-notification';
import TestReplMediatorContext from '@utils/ComponentsMediatorContext';

type TNotification = { notice: (arg0: { content: string; }) => void; };


export default class TopBar extends React.Component {

    static contextType = TestReplMediatorContext;
    context!: React.ContextType<typeof TestReplMediatorContext>;

    isDarkTheme = false;
    fontSize = 12;

    changeSize() {
        this.fontSize = this.fontSize >= 20 ? 8 : this.fontSize + 2;
        this.context!.dispatch('actions.fontSize', this.fontSize);
        notification.newInstance({}, (notification: TNotification) => {
            notification.notice({content: `Font size is ${this.fontSize} px`});
        });
    }

    changeTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.context!.dispatch('actions.changeTheme', this.isDarkTheme);

    }


    render() {
        return (<div className={styles.root}>
            <div className="search-16-basic-500" onClick={() => this.context!.dispatch('actions.find')}/>
            <div className="font-16-basic-500" onClick={() => this.changeSize()}/>
            <div className="darktheme-16-basic-500" onClick={() => this.changeTheme()}/>
        </div>);
    }
}

