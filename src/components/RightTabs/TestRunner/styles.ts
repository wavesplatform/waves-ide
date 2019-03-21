const styles = () => ({
    testRunner: {
        backgroundColor: '#fff',
        '@global': {
            '.ant-dropdown-button': {
                '& button': {
                    background: '#1853fa',
                    border: '1px solid #1853fa',
                    color: '#fff'
                },
                '&:hover': {
                    '& button': {
                        background: '#fff',
                        border: '1px solid #1853fa',
                        color: '#000'
                    },
                }
            }
        }
    },
});

export default styles;
