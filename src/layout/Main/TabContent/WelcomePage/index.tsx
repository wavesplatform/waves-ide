import React from 'react';
import MarkdownViewer from '@src/layout/Main/TabContent/MarkdownViewer';

const files = require('@src/json-data/ride-examples.json').files;

const WelcomePage = () => <MarkdownViewer content={files && files['welcome.md'] ? files['welcome.md'].content : null}/>;
export default WelcomePage;
