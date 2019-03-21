const styles = () => ({
    root: {
        display: 'flex',
        flex: '1',
        backgroundColor: '#fff',
    },
    resizable: {
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        borderTop: '2px solid #E5E7E9',
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'height 0.1s'
    },
    collapser: {
        height: '24px',
        width: '24px',
        minWidth: '24px',
        minHeight: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0'
    }
});

export default styles;
