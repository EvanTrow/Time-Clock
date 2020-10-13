const path = require('path');
var express = require('express');
var json2csv = require('express-json2csv');
var cors = require('cors');
var bodyParser = require('body-parser');
const admin = require('firebase-admin');

const config = require('./src/config');

var api = express();

api.use(
	cors({
		origin: config.api.corsOrigin,
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	})
);

api.use(express.static(path.join(__dirname, '/build')));

// Body Parser Middleware
api.use(bodyParser.json());
api.use(json2csv);

//Setting up server and SQL Connection
(async function () {
	var mssql = require('mssql');
	var sqlServerConnection = await mssql.connect({
		user: config.api.db.user,
		password: config.api.db.password,
		server: config.api.db.server,
		database: config.apidb.database,
		requestTimeout: config.api.db.requestTimeout,
		pool: {
			max: 100,
			min: 0,
			idleTimeoutMillis: 180000,
		},
		options: {
			enableArithAbort: true,
			encrypt: true,
		},
	});
	// client auth
	admin.initializeApp({
		credential: admin.credential.cert(config.firebase.serviceAccount),
		databaseURL: config.firebase.databaseURL,
	});

	start(sqlServerConnection);
})();

api.use(decodeIDToken);
async function decodeIDToken(req, res, next) {
	try {
		if (req.path.startsWith('/api')) {
			if (typeof req.headers.authorization == 'undefined') {
				res.status(403).send({
					originalError: { message: 'You must be logged in!' },
				});
			} else {
				if (req.headers.authorization.startsWith('Bearer ')) {
					const idToken = req.headers.authorization.split('Bearer ')[1];

					try {
						const decodedToken = await admin.auth().verifyIdToken(idToken);
						req['currentUser'] = decodedToken;
					} catch (err) {
						res.status(403).send({
							originalError: { message: 'You must be logged in!' },
						});
					}
				}

				const user = req['currentUser'];
				if (!user) {
					res.status(403).send({
						originalError: { message: 'You must be logged in!' },
					});
				} else {
					next();
				}
			}
		} else {
			next();
		}
	} catch (error) {
		console.error(error.message);
		response.status(500).send(error);
	}
}

async function start(sqlServerConnection) {
	var server = api.listen(config.api.port, function () {
		var port = server.address().port;
		console.log('App now running on port', port);
	});

	// Employee
	var Employee_controller = require('./controllers/Employee')(sqlServerConnection);
	api.get('/api/employee/:employeeId', Employee_controller.info);
	api.post('/api/employee/create/:employeeId', Employee_controller.create);
	api.post('/api/employee/payperiod/:employeeId', Employee_controller.setPayPeriod);

	// Time Clock
	var TimeClock_controller = require('./controllers/TimeClock')(sqlServerConnection);
	api.get('/api/timeclock/:employeeId', TimeClock_controller.timeCard);
	api.post('/api/timeclock/now/:employeeId', TimeClock_controller.clock);
	api.post('/api/timeclock/manual/:employeeId', TimeClock_controller.manual);
	api.post('/api/timeclock/edit/:employeeId', TimeClock_controller.edit);
	api.post('/api/timeclock/delete/:employeeId', TimeClock_controller.delete);
	api.get('/export/timecard/:employeeId', TimeClock_controller.export);

	// utils
	var Utils_controller = require('./controllers/Utils')(sqlServerConnection);
	api.post('/api/utils/validatePin', Utils_controller.validatePin);

	//
	//
	//
	//
	//
	//
	// Handles any requests that don't match the ones above
	api.get('*', async (req, res) => {
		try {
			res.sendFile(path.join(__dirname + '/build/index.html'));
			console;
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	});
}
