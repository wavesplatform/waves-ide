import React from 'react';
import styles from './styles.less';
import notification from 'rc-notification';
import mediator from '@src/services/mediator';
import { events } from '@components/Editor/Editor';

type TNotification = { notice: (arg0: { content: string; }) => void; };

export default class TopBar extends React.Component {

    isDarkTheme = false;
    fontSize = 12;

    openSearchBar = () => mediator.dispatch(events.OPEN_SEARCH_BAR);

    changeSize = () => {
        this.fontSize = this.fontSize >= 20 ? 8 : this.fontSize + 2;
        mediator.dispatch(events.UPDATE_FONT_SIZE, this.fontSize);
        notification.newInstance({}, (notification: TNotification) => {
            notification.notice({content: `Font size is ${this.fontSize} px`});
        });
    };

    changeTheme = () => {
        this.isDarkTheme = !this.isDarkTheme;
        mediator.dispatch(events.UPDATE_THEME, this.isDarkTheme);
    };

    render() {
        return (<div className={styles.root}>
            <div className={styles.searchBtn} onClick={this.openSearchBar}/>
            <div className={styles.fontBtn} onClick={this.changeSize}/>
            <div className={styles.themeBtn} onClick={this.changeTheme}/>
        </div>);
    }
}


