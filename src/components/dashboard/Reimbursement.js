import React from 'react';
import { Link as ReactLink } from 'react-router-dom';

import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
	totalContext: {
		flex: 1,
	},
	cardPricing: {
		display: 'flex',
		alignItems: 'baseline',
		marginBottom: 8,
	},
});

export default function Reimbursement() {
	const classes = useStyles();
	return (
		<React.Fragment>
			<Typography component="h2" variant="h6" color="primary">
				Reimbursement
			</Typography>
			<div className={classes.cardPricing}>
				<Typography variant="h5" color="textPrimary">
					$105.91
				</Typography>
				<Typography variant="overline" color="textSecondary">
					- Mileage
				</Typography>
			</div>
			<div className={classes.cardPricing}>
				<Typography variant="h5" color="textPrimary">
					$30.00
				</Typography>
				<Typography variant="overline" color="textSecondary">
					- Expenses
				</Typography>
			</div>
			<Typography component="h2" variant="h3" color="textPrimary" className={classes.totalContext}>
				$135.91
			</Typography>
			<div>
				<Link color="primary" component={ReactLink} to="/home/reimbursement" button>
					View Reimbursement
				</Link>
			</div>
		</React.Fragment>
	);
}
