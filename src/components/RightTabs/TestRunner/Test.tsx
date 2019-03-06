import React from 'react';
import { runTest } from '@utils/testRunner';

interface IProps {
  title: string
  fullTitle: string
}

const Test = (props: IProps) => {
  const {
      title,
      fullTitle
  } = props;

  return (
    <div
        className="test"
        style={{
            marginLeft: '10px',
            marginBottom: '10px'
        }}
    >
        <div
            className="b-test_header"
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '10px'
            }}
        >
            <div
                className="b-test_runBtn"
                style={{
                    border: '1px solid #0a56ff',
                    borderRadius: '4px',
                    background: '#0a56ff',
                    padding: '0 5px',
                    color: '#fff',
                    cursor: 'pointer',
                    marginRight: '5px'
                }}
                onClick={runTest.bind(null, fullTitle)}
            >
                run
            </div>

            <div className="b-test_title">{`test: ${title}`}</div>
        </div>
    </div>
  );
};

export default Test;
