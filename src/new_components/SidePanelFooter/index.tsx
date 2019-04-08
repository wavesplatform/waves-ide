import React from 'react';
import { inject, observer } from 'mobx-react';
import { FilesStore, FILE_TYPE } from '@stores';

import Menu, { MenuItem } from 'rc-menu';
import Dropdown from 'rc-dropdown';

import styles from './styles.less';

import icons from '../icons';

interface IInjectedProps {
    filesStore?: FilesStore
}

@inject('filesStore')
@observer
class SidePanelFooter extends React.Component<IInjectedProps> {
    private newEmptyFile = (type: FILE_TYPE) => this.props.filesStore!.createFile({type, content: ''}, true);

    private getMenu = () =>
        <Menu>
            <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.RIDE)}>
                <div className="accountdoc-16-basic-600"/> Ride file
            </MenuItem>

            <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.JAVA_SCRIPT)}>
                <div className="systemdoc-16-basic-600"/> Test file
            </MenuItem>
        </Menu>;

    render() {
        return (
            <div className={styles.root}>
                <Dropdown
                    overlayClassName={styles.actionsBtn_dropdown}
                    overlay={this.getMenu()}
                >
                    <div className="add-18-basic-600"/>
                </Dropdown>
            </div>
        );
    }
}

export default SidePanelFooter;
