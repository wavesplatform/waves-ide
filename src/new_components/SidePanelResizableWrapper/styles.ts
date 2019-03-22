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
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'width 0.1s'
    },
    collapser: {
        position: 'absolute!important',
        right: '0',
        width: '24px',
        minWidth: '24px',
        minHeight: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0'
    },
    expandBtn: {
        position: 'absolute',
        top: '0',
        transform: 'rotate(90deg)'
    }
});

export default styles;
