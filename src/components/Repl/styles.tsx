import {Theme} from "@material-ui/core/styles";

const styles = (theme: Theme) => ({
	repl: {
		flex: '0 0 auto',
		backgroundColor: 'white',
	},
	repl_resizable: {
		borderTop: '2px solid #E5E7E9',
		overflow: 'hidden',
		'display': 'flex',
		'flexDirection': 'column'
	},
	repl_collapser: {
		height: '24px',
		width: '24px',
		minWidth: '24px',
		minHeight: '24px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0'
	},
	repl_scrollContainer: {
		overflow: 'scroll',
		height: '100%'
	}
});

export default styles;
