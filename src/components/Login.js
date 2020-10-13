import React from 'react';
import config from '../config';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import SvgIcon from '@material-ui/core/SvgIcon';

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

import { loginWithMicrosoft, login, resetPassword } from '../firebase/auth';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

function MicrosoftIcon(props) {
	return (
		<SvgIcon {...props}>
			<path d="M 9.503906 9.503906 L 0 9.503906 L 0 0 L 9.503906 0 Z M 9.503906 9.503906" fill="#f1511b" />
			<path d="M 20 9.503906 L 10.496094 9.503906 L 10.496094 0 L 19.996094 0 L 19.996094 9.503906 Z M 20 9.503906" fill="#80cc28" />
			<path d="M 9.503906 20 L 0 20 L 0 10.496094 L 9.503906 10.496094 Z M 9.503906 20" fill="#00adef" />
			<path d="M 20 20 L 10.496094 20 L 10.496094 10.496094 L 19.996094 10.496094 L 19.996094 20 Z M 20 20" fill="#fbbc09" />
		</SvgIcon>
	);
}

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function SignIn() {
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [alert, setAlert] = React.useState({ message: '', severity: '' });

	const classes = useStyles();

	const handleUsernameChange = (e) => {
		setUsername(e.target.value);
		if (e.key === 'Enter') {
			login(username, password);
		}
	};
	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		if (e.key === 'Enter') {
			login(username, password).catch(() => {
				setAlert({ message: 'Invalid username or password', severity: 'error' });
			});
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<TextField variant="outlined" margin="normal" required fullWidth label="Username" autoFocus onKeyUp={handleUsernameChange} />
				<TextField variant="outlined" margin="normal" required fullWidth label="Password" type="password" onKeyUp={handlePasswordChange} />
				<Grid container>
					<Grid item xs>
						<Link
							href="#"
							variant="body2"
							onClick={() => {
								if (username.length > 2) {
									resetPassword(username).then(() => {
										setAlert({ message: 'Email sent to: ' + username + '@sltechnology.net', severity: 'info' });
									});
								} else {
									setAlert({ message: 'Enter a username!', severity: 'warning' });
								}
							}}
						>
							Forgot password?
						</Link>
					</Grid>
				</Grid>
				<Button
					fullWidth
					variant="contained"
					color="primary"
					className={classes.submit}
					onClick={() => {
						login(username, password).catch(() => {
							setAlert({ message: 'Invalid username or password', severity: 'error' });
						});
					}}
				>
					Sign In
				</Button>
				{config.Microsoft.enabled && (
					<Button fullWidth variant="contained" startIcon={<MicrosoftIcon />} onClick={loginWithMicrosoft}>
						Sign in with Microsoft
					</Button>
				)}
			</div>
			<Snackbar
				open={alert.message !== ''}
				autoHideDuration={4000}
				onClose={() => {
					setAlert({ message: '', severity: '' });
				}}
			>
				<Alert
					onClose={() => {
						setAlert({ message: '', severity: '' });
					}}
					severity={alert.severity}
				>
					{alert.message}
				</Alert>
			</Snackbar>
		</Container>
	);
}
