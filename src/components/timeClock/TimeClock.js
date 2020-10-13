import React from 'react';
import moment from 'moment';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Grid from '@material-ui/core/Grid';
import Clock from './Clock';
import ManualClock from './ManualClock';
import EditClock from './EditClock';

class TimeClock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			TimeCard1: [],
			TimeCard2: [],
			TimeCard1Total: 0.0,
			TimeCard2Total: 0.0,
		};

		props.setTitle('Time Clock');

		this.getTimeCard();

		this.roundToNearestXXMinutes(moment('2018-12-08 09:37'), 15);
	}

	roundToNearestXXMinutes(start, roundTo) {
		let remainder = roundTo - ((start.minute() + start.second() / 60) % roundTo);
		remainder = remainder > roundTo / 2 ? (remainder = -roundTo + remainder) : remainder;
		const changedDate = moment(start).add(remainder, 'minutes');

		return changedDate;
	}

	getTimeCard = () => {
		fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/timeclock/' + this.props.employeeInfo.employeeId, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.props.user.xa}`,
			},
		}).then((response) => {
			if (!response.ok) {
				response.json().then((text) => {
					console.error(text);
				});
			} else {
				return response.json().then((data) => {
					var fStr = 'YYYY-MM-DDTHH:mm:ss.SSS';

					var timeCard1 = [];
					var timeCard2 = [];
					var timeCard1Total = 0.0;
					var timeCard2Total = 0.0;

					var tempClockCycle = { startId: null, endId: null, date: null, start: null, end: null, hours: null, startIsLast: false, endIsLast: false };
					var step = 0;
					data.forEach((clock) => {
						if (clock.clockStatus) {
							tempClockCycle.startId = clock.clockId;
							tempClockCycle.date = moment(clock.clockTime, fStr).format('MM/DD/YY');
							tempClockCycle.start = this.roundToNearestXXMinutes(moment(clock.clockTime, fStr), 15).format('h:mm a');
						} else {
							tempClockCycle.endId = clock.clockId;
							tempClockCycle.end = this.roundToNearestXXMinutes(moment(clock.clockTime, fStr), 15).format('h:mm a');
							tempClockCycle.hours = moment
								.duration(this.roundToNearestXXMinutes(moment(clock.clockTime, fStr), 15).diff(this.roundToNearestXXMinutes(moment(data[step - 1].clockTime, fStr), 15)))
								.asHours()
								.toFixed(2);

							// if week 1
							if (
								moment(clock.clockTime, fStr).isBetween(
									moment(this.props.employeeInfo.periodStartDate, fStr),
									moment(this.props.employeeInfo.periodEndDate, fStr).subtract(6, 'days').subtract(1, 'seconds')
								)
							) {
								timeCard1.push(tempClockCycle);
								timeCard1Total += parseFloat(tempClockCycle.hours);
							}
							// if week 2
							if (
								moment(clock.clockTime, fStr).isBetween(
									moment(this.props.employeeInfo.periodEndDate, fStr).subtract(6, 'days'),
									moment(this.props.employeeInfo.periodEndDate, fStr).add(1, 'days').subtract(1, 'seconds')
								)
							) {
								timeCard2.push(tempClockCycle);
								timeCard2Total += parseFloat(tempClockCycle.hours);
							}
							tempClockCycle = { startId: null, endId: null, date: null, start: null, end: null, hours: null, startIsLast: false, endIsLast: false };
						}
						step++;
					});
					if (data.length % 2 === 1) {
						var clock = data[data.length - 1];
						tempClockCycle = { startId: null, endId: null, date: null, start: null, end: null, hours: null, startIsLast: false, endIsLast: false };
						tempClockCycle.startId = clock.clockId;
						tempClockCycle.date = moment(clock.clockTime, fStr).format('MM/DD/YY');
						tempClockCycle.start = this.roundToNearestXXMinutes(moment(clock.clockTime, fStr), 15).format('h:mm a');
						tempClockCycle.end = '';
						tempClockCycle.hours = moment
							.duration(this.roundToNearestXXMinutes(moment(), 15).diff(this.roundToNearestXXMinutes(moment(clock.clockTime, fStr), 15)))
							.asHours()
							.toFixed(2);
						tempClockCycle.hours = tempClockCycle.hours < 0 ? 0 : tempClockCycle.hours;
						// if week 1
						if (
							moment(clock.clockTime, fStr).isBetween(
								moment(this.props.employeeInfo.periodStartDate, fStr),
								moment(this.props.employeeInfo.periodEndDate, fStr).subtract(6, 'days').subtract(1, 'seconds')
							)
						) {
							timeCard1.push(tempClockCycle);
							timeCard1Total += parseFloat(tempClockCycle.hours);
						}
						// if week 2
						if (
							moment(clock.clockTime, fStr).isBetween(
								moment(this.props.employeeInfo.periodEndDate, fStr).subtract(6, 'days'),
								moment(this.props.employeeInfo.periodEndDate, fStr).add(1, 'days').subtract(1, 'seconds')
							)
						) {
							timeCard2.push(tempClockCycle);
							timeCard2Total += parseFloat(tempClockCycle.hours);
						}
					}

					if (data.length > 0) {
						if (timeCard2.length === 0) {
							if (timeCard1[timeCard1.length - 1].end === '') {
								timeCard1[timeCard1.length - 1].startIsLast = true;
							} else {
								timeCard1[timeCard1.length - 1].endIsLast = true;
							}
						} else {
							if (timeCard2[timeCard2.length - 1].end === '') {
								timeCard2[timeCard2.length - 1].startIsLast = true;
							} else {
								timeCard2[timeCard2.length - 1].endIsLast = true;
							}
						}
					}
					this.setState({ TimeCard1: timeCard1, TimeCard2: timeCard2, TimeCard1Total: timeCard1Total, TimeCard2Total: timeCard2Total, loading: false });
				});
			}
		});
	};

	render() {
		return (
			<div style={{ padding: '20px' }}>
				{this.state.loading ? (
					<CircularProgress style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto' }} />
				) : (
					<div>
						<Button variant="contained" color="primary" target="_blank" href={'/export/timecard/' + this.props.employeeInfo.employeeId} style={{ float: 'right' }}>
							Export PDF
						</Button>

						<Typography variant="h5" component="h2" style={{ marginTop: 16, marginBottom: 8 }}>
							Week 1 - {this.state.TimeCard1Total.toFixed(2)} hours
						</Typography>
						<TableContainer component={Paper}>
							<Table size="small" aria-label="a dense table">
								<TableHead>
									<TableRow>
										<TableCell>Date</TableCell>
										<TableCell>Start Time</TableCell>
										<TableCell>End Time</TableCell>
										<TableCell>Hours</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.TimeCard1.map((clockCycle) => (
										<TableRow key={Math.random()}>
											<TableCell>{clockCycle.date}</TableCell>
											<TableCell>
												<EditClock
													id={clockCycle.startId}
													date={clockCycle.date}
													time={clockCycle.start}
													last={clockCycle.startIsLast}
													employeeInfo={this.props.employeeInfo}
													user={this.props.user}
													getTimeCard={this.getTimeCard}
												/>
											</TableCell>
											<TableCell>
												<EditClock
													id={clockCycle.endId}
													date={clockCycle.date}
													time={clockCycle.end}
													last={clockCycle.endIsLast}
													employeeInfo={this.props.employeeInfo}
													user={this.props.user}
													getTimeCard={this.getTimeCard}
												/>
											</TableCell>
											<TableCell>{clockCycle.hours} hr/s</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						<Typography variant="h5" component="h2" style={{ marginTop: 16, marginBottom: 8 }}>
							Week 2 - {this.state.TimeCard2Total.toFixed(2)} hours
						</Typography>
						<TableContainer component={Paper}>
							<Table size="small" aria-label="a dense table">
								<TableHead>
									<TableRow>
										<TableCell>Date</TableCell>
										<TableCell>Start Time</TableCell>
										<TableCell>End Time</TableCell>
										<TableCell>Hours</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.TimeCard2.map((clockCycle) => (
										<TableRow key={Math.random()}>
											<TableCell>{clockCycle.date}</TableCell>
											<TableCell>
												<EditClock
													id={clockCycle.startId}
													date={clockCycle.date}
													time={clockCycle.start}
													last={clockCycle.startIsLast}
													employeeInfo={this.props.employeeInfo}
													user={this.props.user}
													getTimeCard={this.getTimeCard}
												/>
											</TableCell>
											<TableCell>
												<EditClock
													id={clockCycle.endId}
													date={clockCycle.date}
													time={clockCycle.end}
													last={clockCycle.endIsLast}
													employeeInfo={this.props.employeeInfo}
													user={this.props.user}
													getTimeCard={this.getTimeCard}
												/>
											</TableCell>
											<TableCell>{clockCycle.hours} hr/s</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
						<Grid container style={{ marginTop: 16, marginBottom: 8 }}>
							<Grid item xs={6}>
								<Clock employeeInfo={this.props.employeeInfo} user={this.props.user} getTimeCard={this.getTimeCard} />
							</Grid>
							<Grid item xs={6}>
								<ManualClock employeeInfo={this.props.employeeInfo} user={this.props.user} getTimeCard={this.getTimeCard} />
							</Grid>
						</Grid>
					</div>
				)}
			</div>
		);
	}
}
export default TimeClock;
