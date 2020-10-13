import React, { Component } from 'react';
import moment from 'moment';

import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Home from './components/Home';
import Login from './components/Login';

import { firebaseAuth } from './firebase/constants';
import { updateDisplayName } from './firebase/auth';

function PrivateRoute({ component: Component, authed, ...rest }) {
	return <Route {...rest} render={(props) => (authed === true ? <Component {...props} /> : <Redirect to={{ pathname: '/', state: { from: props.location } }} />)} />;
}

function PublicRoute({ component: Component, authed, ...rest }) {
	return <Route {...rest} render={(props) => (authed === false ? <Component {...props} /> : <Redirect to="/home" />)} />;
}

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			authed: false,
			loading: true,
			user: null,
			employeeInfo: null,
			pin: 1000,
			name: '',
		};

		this.removeListener = firebaseAuth().onAuthStateChanged((user) => {
			if (user) {
				console.log(user);
				fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/employee/' + user.email, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${user.xa}`,
					},
				}).then((response) => {
					if (!response.ok) {
						return response.json().then((text) => {
							console.error(text);
						});
					} else {
						return response.json().then((data) => {
							if (data.employeeId) {
								this.setState({
									employeeInfo: data,
									user: user,
									authed: true,
									loading: false,
								});
							} else {
								this.handleCreateUser(user);
							}
						});
					}
				});
			} else {
				console.log(user);
				this.setState({
					user: null,
					authed: false,
					loading: false,
				});
			}
		});
	}

	// ============= change display name =====================
	handleDisplayNameDialogOpen = () => {
		this.setState({ displayNameDialogOpen: true }, () => {
			this.generatePin();
		});
	};
	displayNameChange = (e) => {
		var submit = false;
		if (e.key === 'Enter') {
			submit = true;
		}
		this.setState({ name: e.target.value }, () => {
			if (submit) {
				this.SubmitDisplayName();
			}
		});
	};
	pinChange = (e) => {
		console.log(e.target.value);
		var submit = false;
		if (e.key === 'Enter') {
			submit = true;
		}
		this.setState({ pin: e.target.value }, () => {
			if (submit) {
				this.SubmitDisplayName();
			}
		});
	};
	generatePin = async () => {
		var pin = Math.floor(Math.random() * (9999 - 1000) + 1000);
		var validPin = await validatePin(pin, this.state.user);
		if (validPin) {
			this.setState({ pin: pin });
		} else {
			this.generatePin();
		}
	};
	SubmitDisplayName = () => {
		updateDisplayName(this.state.name).then(() => {
			this.createUser();
			this.setState({ displayNameDialogOpen: false });
		});
	};
	// ======================================================

	handleCreateUser = (user) => {
		this.setState({ user: user }, () => {
			this.handleDisplayNameDialogOpen();
		});
	};
	createUser = () => {
		var user = this.state.user;
		fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/employee/create/' + user.email, {
			method: 'POST',
			body: JSON.stringify({ dates: currentPayPeriod(0).split(' - '), name: this.state.name, pin: this.state.pin }),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${user.xa}`,
			},
		}).then((response) => {
			if (!response.ok) {
				response.json().then((text) => {
					console.error(text);
				});
			} else {
				return response.json().then((data) => {
					console.log(data);
					if (data.result === 'success') {
						console.log('Created new user in DB');
						this.setState(
							{
								employeeInfo: data.info,
								user: user,
								authed: true,
								loading: false,
							},
							() => window.location.reload(false)
						);
					} else {
						console.error('Error creating new user in DB');
					}
				});
			}
		});
	};

	render() {
		return this.state.loading === true ? (
			<div>
				<CircularProgress style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto' }} />
				{/* update display name dialog */}
				<Dialog open={this.state.displayNameDialogOpen} aria-labelledby="display-name-dialog">
					<DialogTitle id="form-dialog-title">Full Name</DialogTitle>
					<DialogContent>
						<DialogContentText>We need more information, please enter your full name.</DialogContentText>
						<TextField autoFocus label="Full Name" type="text" fullWidth onKeyUp={(e) => this.displayNameChange(e)} />
						<FormControl fullWidth>
							<InputLabel htmlFor="standard-adornment-password">Quick Clock Pin</InputLabel>
							<Input
								onChange={(e) => this.pinChange(e)}
								value={this.state.pin}
								endAdornment={
									<InputAdornment position="end">
										<IconButton aria-label="toggle password visibility" onClick={(e) => this.generatePin()}>
											<AutorenewIcon />
										</IconButton>
									</InputAdornment>
								}
							/>
						</FormControl>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.SubmitDisplayName} color="primary" disabled={!(this.state.pin >= 1000 && this.state.pin <= 9999 && this.state.name.length > 0)}>
							Submit
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		) : (
			<BrowserRouter>
				{/* <Login /> */}
				<Switch>
					<PublicRoute authed={this.state.authed} exact path="/" component={Login} />
					<PrivateRoute authed={this.state.authed} path="/home" component={(props) => <Home {...props} user={this.state.user} employeeInfo={this.state.employeeInfo} />} />
				</Switch>
			</BrowserRouter>
		);
	}
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

async function validatePin(pin, user) {
	var valid = false;
	await fetch((window.location.hostname === 'localhost' ? 'http://localhost:8080' : '') + '/api/utils/validatePin', {
		method: 'POST',
		body: JSON.stringify({ pin: pin }),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${user.xa}`,
		},
	}).then((response) => {
		if (!response.ok) {
			response.json().then((text) => {
				console.error(text);
			});
		} else {
			return response.json().then((data) => {
				if (data.result === 'success') {
					valid = true;
				} else {
					valid = false;
				}
			});
		}
	});
	return valid;
}
