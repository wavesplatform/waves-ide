import React from 'react';
import Button from '@material-ui/core/Button';
import HelpIcon from '@material-ui/icons/Help';

interface ITutorialsButtonProps {
    infoLink: string;
}

export default ({infoLink}: ITutorialsButtonProps) => (
            <Button
                style={{backgroundColor: '#1f5af6', color: 'white', marginLeft: '15px'}}
                onClick={() => {window.open(infoLink, '_blank'); }}
            >
                <HelpIcon/>
                Tutorials
            </Button>
);
