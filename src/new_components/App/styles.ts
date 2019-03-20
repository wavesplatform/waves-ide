const styles = () => ({
    layout: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between' 
    },
    layout_workPanel: {
        display: 'flex',
        flex: '1',    
    },
    layout_outputPanel: {
        display: 'flex',
        boxShadow: '1px 1px 5px 1px #020202',
    },
    layout_footer: {
        background: '#f8f9fb',
        height: '50px'
    },
    // rightTabsField: {
    //     height: '100%',
    //     maxWidth: '25%',
    //     backgroundColor: 'white',
    // }
});

export default styles;
