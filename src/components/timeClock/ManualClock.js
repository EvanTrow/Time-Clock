import React from 'react';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import DateMomentUtils from '@date-io/moment';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '../Alert';

export default function FormDialog(props) {
	const [open, setOpen] = React.useState(false);
	const [selectedDate, handleDateChange] = React.useState(new Date());

	const [snackbarError, setSnackbarError] = React.useState();
	const [snackbarOpen, setSnackbarOpen] = React.useState(false);
	const [snackbarSeverity, setSnackbarSeverity] = React.useState();

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSnackbarClose = () => {
		setSnackbarOpen(false);
	};
	const handleSnackbarOpen = (error, severity) => {
		setSnackbarOpen(true);
		setSnackbarError(error);
		setSnackbarSeverity(severity);
	};

	const handleManualClock = () => {
		fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/timeclock/manual/' + props.employeeInfo.employeeId, {
			method: 'POST',
			body: JSON.stringify({ datetime: moment(selectedDate).format('MM/DD/YYYY hh:mm:ss a') }),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${props.user.xa}`,
			},
		}).then((response) => {
			if (!response.ok) {
				response.json().then((text) => {
					console.error(text);
				});
			} else {
				return response.json().then((data) => {
					if (data.result === 'success') {
						props.getTimeCard();
						setOpen(false);
					} else if (data.result === 'invalidtime') {
						handleSnackbarOpen('Invalid Date/Time', 'warning');
					} else {
						handleSnackbarOpen('Error processing Clock', 'error');
					}
				});
			}
		});
	};

	return (
		<div>
			<Button variant="contained" color="primary" onClick={handleOpen} style={{ float: 'right' }}>
				Manual Clock
			</Button>
			<Dialog open={open} onClose={handleClose} maxWidth="lg">
				<DialogTitle id="form-dialog-title">Manual Clock</DialogTitle>
				<DialogContent>
					<MuiPickersUtilsProvider utils={DateMomentUtils}>
						<DateTimePicker label="DateTimePicker" inputVariant="outlined" value={selectedDate} onChange={handleDateChange} fullWidth format="MM/DD/YYYY hh:mm a" />
					</MuiPickersUtilsProvider>
					<Button fullWidth variant="contained" color="primary" style={{ marginTop: 8 }} onClick={handleManualClock}>
						Clock
					</Button>
				</DialogContent>
			</Dialog>
			<Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
				<Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
					{snackbarError}
				</Alert>
			</Snackbar>
		</div>
	);
}
