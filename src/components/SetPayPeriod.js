import React from 'react';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import PaginationItem from '@material-ui/lab/PaginationItem';

export default function FormDialog(props) {
	const [open, setOpen] = React.useState(false);
	const [currentCarousel, setCarousel] = React.useState(0);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const setPayPeriod = (dates) => {
		console.log(dates.split(' - '));
		fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/employee/payperiod/' + props.user.email, {
			method: 'POST',
			body: JSON.stringify({ dates: dates.split(' - ') }),
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
						window.location.reload(false);
					}
					// this.setState({ data: data.result, isLoading: false, pageCount: Math.ceil(data.count / 25) });
				});
			}
		});
		handleClose();
	};

	return (
		<div>
			<Button variant="contained" onClick={handleOpen}>
				Set Pay Period
			</Button>
			<Dialog open={open} onClose={handleClose} maxWidth="lg">
				<DialogTitle id="form-dialog-title">Set Pay Period</DialogTitle>
				<DialogContent>
					<PaginationItem
						type="previous"
						onClick={() => {
							setCarousel(currentCarousel - 1);
						}}
					/>
					<PaginationItem
						page={currentPayPeriod(currentCarousel - 1)}
						variant="text"
						style={{ backgroundColor: currentCarousel - 1 === 0 ? '#8fc7404f' : 'transparent' }}
						onClick={() => {
							setPayPeriod(currentPayPeriod(currentCarousel - 1));
						}}
					/>
					<PaginationItem
						page={currentPayPeriod(currentCarousel)}
						variant="text"
						style={{ backgroundColor: currentCarousel === 0 ? '#8fc7404f' : 'transparent' }}
						onClick={() => {
							setPayPeriod(currentPayPeriod(currentCarousel));
						}}
					/>
					<PaginationItem
						page={currentPayPeriod(currentCarousel + 1)}
						variant="text"
						style={{ backgroundColor: currentCarousel + 1 === 0 ? '#8fc7404f' : 'transparent' }}
						onClick={() => {
							setPayPeriod(currentPayPeriod(currentCarousel + 1));
						}}
					/>
					<PaginationItem
						type="next"
						onClick={() => {
							setCarousel(currentCarousel + 1);
						}}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
function currentPayPeriod(plusminus = 0, returnFormat = 'MM/DD/YYYY') {
	plusminus = plusminus * 2;
	var currentWeek = moment().week() + plusminus;

	var currentPayPeriodFirstWeek = currentWeek;
	if (currentWeek % 2 === 1) {
		currentPayPeriodFirstWeek = currentWeek - 1;
	}

	return (
		moment().day('Sunday').week(currentPayPeriodFirstWeek).format(returnFormat) +
		' - ' +
		moment()
			.day('Saturday')
			.week(currentPayPeriodFirstWeek + 1)
			.format(returnFormat)
	);
}
