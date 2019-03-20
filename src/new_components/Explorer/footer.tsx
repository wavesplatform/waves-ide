import React from 'react';
import { inject, observer } from 'mobx-react';
import { FilesStore, FILE_TYPE } from '../../mobx-store';
import styles from './styles.less';
import 'rc-menu/assets/index.css';
import 'rc-dropdown/assets/index.css';
import Menu, { MenuItem } from 'rc-menu';
import Dropdown from 'rc-dropdown';
import icons from './icons';

interface IInjectedProps {
    filesStore?: FilesStore
}

@inject('filesStore')
@observer
export default class Explorer extends React.Component<IInjectedProps> {

    constructor(props: IInjectedProps) {
        super(props);
    }

    newEmptyFile = (type: FILE_TYPE) => this.props.filesStore!.createFile({type, content: ''}, true);

    getMenu = () => <Menu>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.ACCOUNT_SCRIPT)}>
            {icons.file} Account script</MenuItem>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.ASSET_SCRIPT)}>
            {icons.file} Asset script</MenuItem>
        <MenuItem onClick={this.newEmptyFile.bind(this, FILE_TYPE.TEST)}>{icons.file} Test script</MenuItem>
    </Menu>;

    render() {
        return <footer className={styles.expFooter}><Dropdown overlay={this.getMenu()}>{icons.plus}</Dropdown></footer>;
    }
}
