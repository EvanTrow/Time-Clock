import React from 'react';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import TimeCardChart from './TimeCardChart';
import Reimbursement from './Reimbursement';
import TimeCard from './TimeCard';

// import { DisplayMapClass } from '../DisplayMapClass';

class test extends React.Component {
	constructor(props) {
		super(props);
		props.setTitle('Dashboard');
	}
	render() {
		const styles = {
			paper: {
				padding: 16,
				display: 'flex',
				overflow: 'auto',
				flexDirection: 'column',
			},
			paperFixed: {
				padding: 16,
				display: 'flex',
				overflow: 'auto',
				flexDirection: 'column',
				height: 240,
			},
		};

		return (
			<Container maxWidth="lg" style={{ marginTop: 30 }}>
				<Grid container spacing={3}>
					{/* Chart */}
					<Grid item xs={12} md={8} lg={9}>
						<Paper style={styles.paperFixed}>
							<TimeCardChart employeeInfo={this.props.employeeInfo} user={this.props.user} />
						</Paper>
					</Grid>
					{/* Recent Deposits */}
					<Grid item xs={12} md={4} lg={3}>
						Example Data
						<Paper style={styles.paperFixed}>
							<Reimbursement />
						</Paper>
					</Grid>
					{/* Recent Orders */}
					<Grid item xs={12}>
						Example Data
						<Paper style={styles.paper}>
							<TimeCard />
						</Paper>
					</Grid>
				</Grid>
			</Container>
		);
	}
}
export default test;
