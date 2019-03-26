import React from 'react';
import styles from './styles.less';
import icons from '../icons';
import TestReplMediatorContext from '@utils/ComponentsMediatorContext';


export default class TopBar extends React.Component {

    static contextType = TestReplMediatorContext;
    context!: React.ContextType<typeof TestReplMediatorContext>;

    isDarkTheme = false;

    changeSize(event: any) {
        this.context!.dispatch('actions.fontSize', event.target.value || 12);
    }

    changeTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.context!.dispatch('actions.changeTheme', this.isDarkTheme);

    }


    render() {
        return (<div className={styles.root}>
            <div className={styles.iconBtn} onClick={() => this.context!.dispatch('actions.find')}>
                {icons.search}
            </div>
            <div className={styles.iconBtn}>
                <select defaultValue={'12'} ref={'fontSize'} onChange={this.changeSize.bind(this)}>
                    <option value="8">8px</option>
                    <option value="10">10px</option>
                    <option value="12" >12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                </select>
            </div>
            <div className={styles.iconBtn} onClick={() => this.changeTheme()}>
                {icons.bulb}
            </div>
        </div>);
    }
}

