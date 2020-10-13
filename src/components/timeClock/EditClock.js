import React from 'react';
import moment from 'moment';

import Link from '@material-ui/core/Link';
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
	const [selectedDate, handleDateChange] = React.useState(Date.parse(props.date + ' ' + props.time));

	const [snackbarError, setSnackbarError] = React.useState();
	const [snackbarOpen, setSnackbarOpen] = React.useState(false);
	const [snackbarSeverity, setSnackbarSeverity] = React.useState();
	const [snackbarAction, setSnackbarAction] = React.useState(null);
	const [snackbarAutoHide, setSnackbarAutoHide] = React.useState(5000);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSnackbarClose = () => {
		setSnackbarOpen(false);
		setSnackbarAction(null);
		setSnackbarAutoHide(5000);
	};
	const handleSnackbarOpen = (error, severity, action, autoHide) => {
		setSnackbarOpen(true);
		setSnackbarError(error);
		setSnackbarSeverity(severity);
		setSnackbarAction(action);
		setSnackbarAutoHide(autoHide);
	};

	const handleManualClock = () => {
		fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/timeclock/edit/' + props.employeeInfo.employeeId, {
			method: 'POST',
			body: JSON.stringify({ datetime: moment(selectedDate).format('MM/DD/YYYY hh:mm:ss a'), id: props.id }),
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
					} else {
						handleSnackbarOpen('Error editing Clock', 'error', null, 5000);
					}
				});
			}
		});
	};

	const handleDeleteClock = () => {
		fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/timeclock/delete/' + props.employeeInfo.employeeId, {
			method: 'POST',
			body: JSON.stringify({ id: props.id }),
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
					} else if (data.result === 'invalidclockid') {
						handleSnackbarOpen(
							'An error occurred please refresh',
							'warning',
							<Button variant="contained" size="small" onClick={() => window.location.reload()}>
								Refresh
							</Button>,
							null
						);
					} else {
						handleSnackbarOpen('Error deleteing clock', 'error', null, 5000);
					}
				});
			}
		});
	};

	return (
		<div>
			<Link
				href="#"
				color="inherit"
				onClick={(event) => {
					event.preventDefault();
					handleOpen();
				}}
			>
				{props.time}
			</Link>
			<Dialog open={open} onClose={handleClose} maxWidth="lg">
				<DialogTitle id="form-dialog-title">Edit Clock</DialogTitle>
				<DialogContent>
					<MuiPickersUtilsProvider utils={DateMomentUtils}>
						<DateTimePicker label="DateTimePicker" inputVariant="outlined" value={selectedDate} onChange={handleDateChange} fullWidth format="MM/DD/YYYY hh:mm a" />
					</MuiPickersUtilsProvider>

					{props.last ? (
						<Button variant="contained" style={{ backgroundColor: '#f44336', color: '#fff', marginTop: 8 }} onClick={handleDeleteClock}>
							Delete
						</Button>
					) : (
						<span />
					)}

					<Button variant="contained" color="primary" style={{ marginTop: 8, float: 'right' }} onClick={handleManualClock}>
						Edit
					</Button>
				</DialogContent>
			</Dialog>
			<Snackbar open={snackbarOpen} autoHideDuration={snackbarAutoHide} onClose={handleSnackbarClose}>
				<Alert onClose={handleSnackbarClose} severity={snackbarSeverity} action={snackbarAction}>
					{snackbarError}
				</Alert>
			</Snackbar>
		</div>
	);
}
