import React, { Component } from 'react';
import Files from 'react-files';
import styles from './styles.less'
import btnStyles from '@components/Button/styles.less'
import classNames from 'classnames';

interface IProps {
    onLoad?: (data: any) => void
}

export default class FileLoader extends Component<IProps> {

    fileReader: any;

    constructor(props: IProps) {
        super(props);
        this.fileReader = new FileReader();
        this.fileReader.onload = (event: any) => props.onLoad && props.onLoad(JSON.parse(event.target.result));
    }

    render() {
        return <Files
            className={classNames(btnStyles.btn, styles.fileLoader)}
            onChange={(file: any) => {
                this.fileReader.readAsText(file[0]);
            }}
            onError={(err: any) => console.log(err)}
            accepts={['.json']}
            multiple
            maxFiles={3}
            maxFileSize={10000000}
            minFileSize={0}
            clickable
        >
            {this.props.children}
        </Files>;
    }
}
