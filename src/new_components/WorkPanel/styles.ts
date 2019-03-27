const styles = () => ({
    workPanel: {
        display: 'flex',
        flexDirection: 'row',
        flex: '1',
        overflow: 'hidden'
    },

    sidePanel: {
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e4e8ee'
    },
    sidePanel_header: {
        height: '64px',
        borderBottom: '1px solid #e4e8ee'
    },
    sidePanel_content: {
        display: 'flex',
        flex: '1'
    },
    sidePanel_footer: {
        height: '50px',
        background: '#f8f9fb'
    },

    mainPanel: {
        display: 'flex',
        flex: '1 1 0px',
        minWidth: '150px',
        flexDirection: 'column'
    },
    mainPanel_header: {
        display: 'flex',
        height: '64px',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e4e8ee'
    },
    mainPanel_tabs: {
        flex: 1,
        overflow: 'hidden'
    },
    mainPanel_account: {
        width: '100px'
    },
    mainPanel_settings: {
        width: '50px'
    },
    mainPanel_content: {
        display: 'flex',
        flex: '1'
    },
    mainPanel_footer: {
        height: '50px',
        background: '#f8f9fb'
    }
});

export default styles;
