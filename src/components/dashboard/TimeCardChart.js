import React from 'react';
import moment from 'moment';
import { withTheme } from '@material-ui/core/styles';

import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import Typography from '@material-ui/core/Typography';

import CircularProgress from '@material-ui/core/CircularProgress';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			loading: true,
		};
	}

	componentDidMount() {
		this.getTimeCard();
	}

	roundToNearestXXMinutes(start, roundTo) {
		let remainder = roundTo - ((start.minute() + start.second() / 60) % roundTo);
		remainder = remainder > roundTo / 2 ? (remainder = -roundTo + remainder) : remainder;
		const changedDate = moment(start).add(remainder, 'minutes');

		return changedDate;
	}
	search(nameKey, myArray) {
		for (var i = 0; i < myArray.length; i++) {
			if (myArray[i].name === nameKey) {
				return myArray[i];
			}
		}
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

					var chartData = [];

					for (let index = 0; index < 14; index++) {
						chartData.push({ time: moment(this.props.employeeInfo.periodStartDate, fStr).add(index, 'days').format('MM/DD'), amount: 0 });
					}

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

							chartData[chartData.findIndex((x) => x.time === moment(clock.clockTime, fStr).format('MM/DD'))].amount += parseFloat(tempClockCycle.hours);

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
						chartData[chartData.findIndex((x) => x.time === moment(clock.clockTime, fStr).format('MM/DD'))].amount += parseFloat(tempClockCycle.hours);
					}

					this.setState({ data: chartData, loading: false });
				});
			}
		});
	};

	render() {
		return (
			<React.Fragment>
				<Typography component="h2" variant="h6" color="primary" gutterBottom>
					This Pay Period
				</Typography>
				{this.state.loading ? (
					<div style={{ position: 'relative' }}>
						<CircularProgress style={{ position: 'absolute', top: '50%', left: '50%' }} />
					</div>
				) : (
					<ResponsiveContainer>
						<LineChart
							data={this.state.data}
							margin={{
								top: 16,
								right: 16,
								bottom: 0,
								left: 16,
							}}
						>
							<XAxis dataKey="time" stroke={this.props.theme.palette.text.secondary} />
							<YAxis stroke={this.props.theme.palette.text.secondary}>
								<Label angle={270} position="left" style={{ textAnchor: 'middle', fill: this.props.theme.palette.text.primary }}>
									Hours
								</Label>
							</YAxis>
							<Line type="monotone" dataKey="amount" stroke={this.props.theme.palette.primary.main} dot={false} />
						</LineChart>
					</ResponsiveContainer>
				)}
			</React.Fragment>
		);
	}
}

export default withTheme(Chart);
