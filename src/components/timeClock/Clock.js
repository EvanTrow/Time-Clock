import React from 'react';

import Button from '@material-ui/core/Button';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '../Alert';

export default function FormDialog(props) {
	const [snackbarError, setSnackbarError] = React.useState();
	const [snackbarOpen, setSnackbarOpen] = React.useState(false);
	const [snackbarSeverity, setSnackbarSeverity] = React.useState();

	const handleSnackbarClose = () => {
		setSnackbarOpen(false);
	};
	const handleSnackbarOpen = (error, severity) => {
		setSnackbarOpen(true);
		setSnackbarError(error);
		setSnackbarSeverity(severity);
	};

	const handleClock = () => {
		fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/timeclock/now/' + props.employeeInfo.employeeId, {
			method: 'POST',
			body: JSON.stringify({ test: 'yeet' }),
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
					} else if (data.result === 'invalidtime') {
						handleSnackbarOpen('Manaul clock is after the current time.', 'warning');
					} else {
						handleSnackbarOpen('Error processing Clock', 'error');
					}
				});
			}
		});
	};

	return (
		<div>
			<Button variant="contained" color="primary" onClick={handleClock}>
				Clock
			</Button>
			<Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
				<Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
					{snackbarError}
				</Alert>
			</Snackbar>
		</div>
	);
}
