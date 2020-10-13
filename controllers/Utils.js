module.exports = function (sqlServerConnection, db) {
	var module = {};

	module.validatePin = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';
			console.log(request.body);

			var pin = parseInt(request.body.pin);
			// if (pin.length !== 4) {
			// 	response.send({ result: 'error' });
			// }

			// get records
			let result = await sqlServerConnection.request().query(`SELECT count(*) as matches FROM EmployeeInfo WHERE employeePin = '${pin}'`);

			console.log(result);
			if (result.recordsets[0][0].matches === 0) {
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
