import React from 'react';

import { runTest } from '@utils/testRunner';

import Test from './Test';

interface IProps {
    title: string
    fullTitle: string
    suites: any[]
    tests: any[]
}

const Suite = (props: IProps) => {
    const {
        title,
        fullTitle,
        suites,
        tests
    } = props;

    return (
        <div
            className="b-suite"
            style={{
                marginLeft: '10px',
                marginBottom: '10px'
            }}
        >
            <div
                className="b-suite_header"
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                }}
            >
                <div
                    className="b-suite_runBtn"
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

                <div
                    className="b-suite_title"
                    style={{
                        fontWeight: 'bold'
                    }}
                >
                    {`suite: ${title}`}
                </div>
            </div>

            <div className="suites">
                {suites.map((suite: any, i: number) => (
                    <Suite
                        key={i}
                        title={suite.title}
                        fullTitle={suite.fullTitle()}
                        suites={suite.suites}
                        tests={suite.tests}
                    />
                ))}
            </div>
            <div className="tests">
                {tests.map((test: any, i: number) => (
                    <Test
                        key={i}
                        title={test.title}
                        fullTitle={test.fullTitle()}
                    />
                ))}
            </div>
        </div>
    );
};

export default Suite;
