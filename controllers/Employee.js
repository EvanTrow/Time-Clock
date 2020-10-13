module.exports = function (sqlServerConnection, db) {
	var module = {};

	module.info = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';

			// get records
			let result = await sqlServerConnection.request().query(`SELECT * FROM EmployeeInfo WHERE employeeId = '${employeeId}'`);

			var output = result.recordsets[0][0];

			if (result.recordsets[0].length === 0) {
				response.send({ error: 'not-found' });
			} else {
				response.send(output);
			}
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	module.create = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';
			console.log(request.body);

			// get records
			let result = await sqlServerConnection.request().query(`INSERT INTO EmployeeInfo (employeeId, employeeName, employeePin, employeeActive, periodStartDate, periodEndDate) 
				VALUES ('${employeeId}', '${request.body.name}', ${request.body.pin}, 1, '${request.body.dates[0]}', '${request.body.dates[1]}');
			`);

			console.log(result);
			if (result.rowsAffected[0] === 1) {
				response.send({
					result: 'success',
					info: {
						employeeId: employeeId,
						employeeName: request.body.name,
						employeePin: request.body.pin,
						employeeActive: true,
						isAdmin: false,
						periodStartDate: request.body.dates[0],
						periodEndDate: request.body.dates[1],
					},
				});
			} else {
				response.send({ result: 'error' });
			}
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	module.setPayPeriod = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';

			console.log(request.body.dates[0]);

			var start = request.body.dates[0];
			var end = request.body.dates[1];

			// get records
			let result = await sqlServerConnection.request().query(`UPDATE EmployeeInfo
			SET periodStartDate = '${start}', periodEndDate = '${end}'
			WHERE employeeId = '${employeeId}'`);

			console.log(result);

			if (result.rowsAffected[0] === 1) {
				response.send({ result: 'success' });
			} else {
				response.send({ result: 'error' });
			}
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	return module;
};
