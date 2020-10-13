import React from 'react';
import { Link as ReactLink } from 'react-router-dom';

import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

// Generate Order Data
function createData(id, date, start, end, hours) {
	return { id, date, start, end, hours };
}

const rows = [
	createData(0, '09/11/20', '8:30 pm', '10:30 pm', '2.00 hrs'),
	createData(1, '09/12/20', '9:30 am', '2:00 pm', '4.50 hrs'),
	createData(2, '09/12/20', '9:30 am', '2:00 pm', '4.50 hrs'),
	createData(3, '09/12/20', '9:30 am', '2:00 pm', '4.50 hrs'),
	createData(4, '09/12/20', '9:30 am', '2:00 pm', '4.50 hrs'),
];

const useStyles = makeStyles((theme) => ({
	seeMore: {
		marginTop: theme.spacing(3),
	},
}));

export default function Orders() {
	const classes = useStyles();
	return (
		<React.Fragment>
			<Typography component="h2" variant="h6" color="primary" gutterBottom>
				Time Card
			</Typography>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>Date</TableCell>
						<TableCell>Start Time</TableCell>
						<TableCell>End Time</TableCell>
						<TableCell>Hours</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow key={row.id}>
							<TableCell>{row.date}</TableCell>
							<TableCell>{row.start}</TableCell>
							<TableCell>{row.end}</TableCell>
							<TableCell>{row.hours}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className={classes.seeMore}>
				<Link color="primary" component={ReactLink} to="/home/timeclock" button>
					See more
				</Link>
			</div>
		</React.Fragment>
	);
}
