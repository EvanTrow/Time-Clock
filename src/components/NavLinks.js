import React from 'react';
import config from '../config';

import { Link } from 'react-router-dom';

import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import DashboardIcon from '@material-ui/icons/Dashboard';
import TimerIcon from '@material-ui/icons/Timer';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SvgIcon from '@material-ui/core/SvgIcon';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import TuneIcon from '@material-ui/icons/Tune';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { logout, changePassword, linkMicrosoft } from '../firebase/auth';

class navMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			open: true,
			name: props.employeeInfo.employeeName,
			profileImg: '/logo.png',

			MicrosoftLinked: false,
			passwordAuth: false,

			passwordDialogOpen: false,
			currentPassword: '',
			password1: '',
			password2: '',
		};
	}

	componentDidMount() {
		// check if azure img exists and set image state
		this.props.user.providerData.forEach((provider) => {
			if (provider.providerId === 'microsoft.com') {
				var img = new Image();
				img.src = `https://outlook.office.com/owa/service.svc/s/GetPersonaPhoto?email=${provider.email}&size=HR96x96`;
				img.onload = () => {
					if (img.height > 1) {
						this.setState({
							profileImg: `https://outlook.office.com/owa/service.svc/s/GetPersonaPhoto?email=${provider.email}&size=HR96x96`,
							MicrosoftLinked: true,
						});
					}
				};
			}
			if (provider.providerId === 'password') {
				this.setState({
					passwordAuth: true,
				});
			}
		});
	}

	handlePasswordDialogOpen = () => {
		this.setState({ passwordDialogOpen: true });
	};
	passwordChange = (e) => {
		var submit = false;
		if (e.key === 'Enter') {
			submit = true;
		}
		this.setState({ [e.target.id]: e.target.value }, () => {
			if (submit && this.state.password1 === this.state.password2 && this.state.password1.length >= 8) {
				this.SubmitPassword();
			}
		});
	};
	SubmitPassword = () => {
		changePassword(this.props.user.displayName, this.state.currentPassword, this.state.password1).then(() => {
			this.setState({ passwordDialogOpen: false });
		});
	};

	render() {
		return (
			<div>
				<div>
					<ListItem>
						<ListItemAvatar>
							<Avatar alt="Profile" src={this.state.profileImg} />
						</ListItemAvatar>
						<ListItemText primary={this.state.name} secondary={this.props.employeeInfo.employeePin} />
					</ListItem>
					<Divider />
					<ListItem component={Link} to="/home" button>
						<ListItemIcon>
							<DashboardIcon />
						</ListItemIcon>
						<ListItemText primary="Dashboard" />
					</ListItem>
					<ListItem component={Link} to="/home/timeclock" button>
						<ListItemIcon>
							<TimerIcon />
						</ListItemIcon>
						<ListItemText primary="Time Clock" />
					</ListItem>
					<ListItem disabled component={Link} to="/home/reimbursement" button>
						<ListItemIcon>
							<AttachMoneyIcon />
						</ListItemIcon>
						<ListItemText primary="Reimbursement" />
					</ListItem>
					<ListSubheader inset>Account</ListSubheader>

					{/* show if user is notauthenicated M365 */}
					{config.Microsoft.enabled && (
						<ListItem onClick={linkMicrosoft} button style={{ display: this.state.MicrosoftLinked ? 'none' : 'flex' }}>
							<ListItemIcon>
								<SvgIcon>
									<path d="M 9.503906 9.503906 L 0 9.503906 L 0 0 L 9.503906 0 Z M 9.503906 9.503906" fill="#f1511b" />
									<path d="M 20 9.503906 L 10.496094 9.503906 L 10.496094 0 L 19.996094 0 L 19.996094 9.503906 Z M 20 9.503906" fill="#80cc28" />
									<path d="M 9.503906 20 L 0 20 L 0 10.496094 L 9.503906 10.496094 Z M 9.503906 20" fill="#00adef" />
									<path d="M 20 20 L 10.496094 20 L 10.496094 10.496094 L 19.996094 10.496094 L 19.996094 20 Z M 20 20" fill="#fbbc09" />
								</SvgIcon>
							</ListItemIcon>
							<ListItemText primary="Link Microsoft 365" />
						</ListItem>
					)}
					{/* show if user is authenicated with username/password */}
					<ListItem onClick={this.handlePasswordDialogOpen} button style={{ display: this.state.passwordAuth ? 'flex' : 'none' }}>
						<ListItemIcon>
							<LockOutlinedIcon />
						</ListItemIcon>
						<ListItemText primary="Change Password" />
					</ListItem>
					<ListItem button onClick={logout}>
						<ListItemIcon>
							<ExitToAppIcon />
						</ListItemIcon>
						<ListItemText primary="Sign Out" />
					</ListItem>
					<div style={{ display: this.props.employeeInfo.isAdmin ? 'block' : 'none' }}>
						<ListSubheader inset>Administration</ListSubheader>
						<ListItem button>
							<ListItemIcon>
								<TuneIcon />
							</ListItemIcon>
							<ListItemText primary="System Settings" />
						</ListItem>
						<ListItem button>
							<ListItemIcon>
								<SupervisorAccountIcon />
							</ListItemIcon>
							<ListItemText primary="Users" />
						</ListItem>
					</div>
				</div>

				{/* change password dialog */}
				<Dialog
					open={this.state.passwordDialogOpen}
					onClose={() => {
						this.setState({ passwordDialogOpen: false });
					}}
					aria-labelledby="password-dialog"
				>
					<DialogTitle id="form-dialog-title">Change Password</DialogTitle>
					<DialogContent>
						<TextField autoFocus label="Current" type="password" id="currentPassword" fullWidth onKeyUp={(e) => this.passwordChange(e)} />
						<TextField label="New Password" type="password" id="password1" fullWidth onKeyUp={(e) => this.passwordChange(e)} />
						<TextField label="Confirm Password" type="password" id="password2" fullWidth onKeyUp={(e) => this.passwordChange(e)} />
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => {
								this.setState({ passwordDialogOpen: false });
							}}
						>
							Cancel
						</Button>
						<Button onClick={this.SubmitPassword} color="primary" disabled={!(this.state.password1 === this.state.password2 && this.state.password1.length >= 8)}>
							Submit
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
}
export default navMenu;
