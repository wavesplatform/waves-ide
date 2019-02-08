import {Theme} from "@material-ui/core/styles";

const styles = (theme: Theme) => ({
	replWrapper: {
		backgroundColor: '#fff',
	},
	replWrapper_resizable: {
		borderTop: '2px solid #E5E7E9',
		overflow: 'hidden',
		backgroundColor: '#fff',
	},
	replWrapper_collapser: {
		height: '24px',
		width: '24px',
		minWidth: '24px',
		minHeight: '24px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0'
	},
	replWrapper_scrollContainer: {
		overflow: 'scroll',
		height: '100%'
	}
});

export default styles;
