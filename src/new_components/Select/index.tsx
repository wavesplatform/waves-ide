import React from 'react';
import RcSelect, { Option } from 'rc-select';
import styles from './styles.less';
import classNames = require("classnames");

type TOption = {
    title: string | number
    value: string | number
};

interface IProps {
    options: TOption[]
    onChange: (v: string) => void;
    value?: string | number
    className?: string
    name?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
}

export default class Select extends React.Component<IProps> {
    popupContainer: any;

    state = {value: this.props.value};

    handleGetPopupContainer = (node: any) => {
        this.popupContainer = node;
        this.scrollToValue();
        return node;
    };

    handleDropdownVisibleChange = (bool: boolean) => {
        if (bool) this.scrollToValue();
    };

    handleChange = (v: any) => {
        v = String(v);
        this.props.onChange(v);
        this.setState({value: v});
    };

    scrollToValue = () => {
        if (this.popupContainer) {
            setTimeout(() => {
                const popup = this.popupContainer.querySelector('.rc-select-dropdown');
                const selected = popup.querySelector(`[title="${this.state.value}"]`);
                popup.scrollTop = selected.offsetTop;
            }, 0);
        }
    };

    render(): React.ReactNode {
        const {options, value, className, name, required, disabled} = this.props;
        return <div className={styles.root}>
            <RcSelect
                name={name}
                value={value}
                required={required}
                optionLabelProp="children"
                onDropdownVisibleChange={this.handleDropdownVisibleChange}
                onChange={this.handleChange}
                getPopupContainer={this.handleGetPopupContainer}
                className={classNames(className, 'invalid')}
                disabled={disabled}
            >
                {options.map(({title, value}, i) =>
                    <Option label={title} key={i} value={value} title={value.toString()}>{title}</Option>)
                }
            </RcSelect>
        </div>;


    }
}
