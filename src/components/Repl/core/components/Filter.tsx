import * as React from 'react';
import {debounce} from 'lodash';
import {createRef} from "react";

export class Filter extends React.Component<any> {
    private inputRef = createRef<HTMLInputElement>();

    componentDidUpdate(prevProps: any) {
        if (this.props.enabled !== prevProps.enabled && this.inputRef.current) {
            if (this.props.enabled) {
                this.inputRef.current.focus();
            } else {
                this.inputRef.current.value = '';
                this.props.onFilter(null);
            }
        }
    }

    render() {
        const {
            children, enabled, onFilter = () => {
            }
        } = this.props;

        const filter = debounce(onFilter, 100);

        const className = enabled ? 'is-visible' : 'is-hidden';

        return (
            <span className={`Filter ${className}`}>
        <span className="inner">
          <input
              ref={this.inputRef}
              onChange={e => {
                  filter(e.target.value.trim().toLowerCase());
              }}
              onKeyDown={e => e.stopPropagation()}
              type="text"
          />
        </span>
                {children}
      </span>
        );
    }
}