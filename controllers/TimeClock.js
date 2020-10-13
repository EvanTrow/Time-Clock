const sql = require('mssql');
const moment = require('moment');

module.exports = function (sqlServerConnection, db) {
	var module = {};

	module.timeCard = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';

			// get records
			let result = await sqlServerConnection.request().query(`DECLARE @periodStartDate DateTime; DECLARE @periodEndDate DateTime
			select @periodStartDate=periodStartDate, @periodEndDate=periodEndDate
			from EmployeeInfo where employeeId = '${employeeId}'
			set @periodEndDate = DATEADD(HOUR,23, DATEADD(MINUTE,59, DATEADD(SECOND,59, @periodEndDate)))
			
			SELECT * FROM [SLTechnology].[dbo].[TimeClock]
			WHERE employeeId = '${employeeId}' 
			AND clockTime BETWEEN @periodStartDate AND @periodEndDate`);

			var output = result.recordsets[0];
			response.send(output);
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	module.clock = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';

			// get records
			let result = await sqlServerConnection
				.request()
				.input('employeeId', sql.VarChar(50), employeeId)
				.input('clockTime', sql.VarChar(50), moment().format('MM/DD/YYYY hh:mm:ss a'))
				.execute('ClockTransaction');

			if (result.returnValue === 1) {
				response.send({ result: 'success', info: { employeeId: employeeId } });
			} else if (result.returnValue === -1) {
				response.send({ result: 'invalidtime', info: { employeeId: employeeId } });
			} else {
				response.send({ result: 'error' });
			}
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	module.manual = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';

			// get records
			let result = await sqlServerConnection.request().input('employeeId', sql.VarChar(50), employeeId).input('clockTime', sql.VarChar(50), request.body.datetime).execute('ClockTransaction');

			if (result.returnValue === 1) {
				response.send({ result: 'success', info: { employeeId: employeeId } });
			} else if (result.returnValue === -1) {
				response.send({ result: 'invalidtime', info: { employeeId: employeeId } });
			} else {
				response.send({ result: 'error' });
			}
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	module.edit = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';

			// get records
			let result = await sqlServerConnection.request().query(`UPDATE TimeClock
			SET clockTime = '${request.body.datetime}'
			WHERE clockId='${request.body.id}' AND employeeId='${employeeId}'`);

			if (result.rowsAffected[0] === 1) {
				response.send({ result: 'success', info: { employeeId: employeeId } });
			} else {
				response.send({ result: 'error', info: { employeeId: employeeId } });
			}
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	module.delete = async (request, response) => {
		try {
			// request params & varables
			var employeeId = request.params.employeeId || '';

			// get records
			let result = await sqlServerConnection
				.request()
				.input('employeeId', sql.VarChar(50), employeeId)
				.input('deleteClockId', sql.Int, parseInt(request.body.id))
				.execute('DeleteClockTransaction');

			if (result.returnValue === 1) {
				response.send({ result: 'success', info: { employeeId: employeeId } });
			} else if (result.returnValue === -1) {
				response.send({ result: 'invalidclockid', info: { employeeId: employeeId } });
			} else {
				response.send({ result: 'error' });
			}
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	module.export = async (request, response) => {
		try {
			var employeeId = request.params.employeeId || '';

			let result = await sqlServerConnection.request().query(`DECLARE @periodStartDate DateTime; DECLARE @periodEndDate DateTime
			select @periodStartDate=periodStartDate, @periodEndDate=periodEndDate
			from EmployeeInfo where employeeId = '${employeeId}'
			set @periodEndDate = DATEADD(HOUR,23, DATEADD(MINUTE,59, DATEADD(SECOND,59, @periodEndDate)))
			
			SELECT * FROM [SLTechnology].[dbo].[TimeClock]
			WHERE employeeId = '${employeeId}' 
			AND clockTime BETWEEN @periodStartDate AND @periodEndDate
			
			SELECT * FROM EmployeeInfo WHERE employeeId = '${employeeId}'`);

			var data = result.recordsets[0];
			var employeeInfo = result.recordsets[1][0];

			var fStr = 'YYYY-MM-DDTHH:mm:ss.SSS';

			var timeCard1 = [];
			var timeCard2 = [];
			var timeCard1Total = 0.0;
			var timeCard2Total = 0.0;

			var tempClockCycle = { date: null, start: null, end: null, hours: null };
			var step = 0;
			data.forEach((clock) => {
				if (clock.clockStatus) {
					tempClockCycle.date = moment(clock.clockTime, fStr).utc().format('MM/DD/YY');
					tempClockCycle.start = roundToNearestXXMinutes(moment(clock.clockTime, fStr).utc(), 15).format('h:mm a');
				} else {
					tempClockCycle.end = roundToNearestXXMinutes(moment(clock.clockTime, fStr).utc(), 15).format('h:mm a');
					tempClockCycle.hours = moment
						.duration(roundToNearestXXMinutes(moment(clock.clockTime, fStr).utc(), 15).diff(roundToNearestXXMinutes(moment(data[step - 1].clockTime, fStr).utc(), 15)))
						.asHours()
						.toFixed(2);

					// if week 1
					if (
						moment(clock.clockTime, fStr)
							.utc()
							.isBetween(moment(employeeInfo.periodStartDate, fStr).utc(), moment(employeeInfo.periodEndDate, fStr).utc().subtract(6, 'days').subtract(1, 'seconds'))
					) {
						timeCard1.push([tempClockCycle.date, tempClockCycle.start, tempClockCycle.end, tempClockCycle.hours]);
						timeCard1Total += parseFloat(tempClockCycle.hours);
					}
					// if week 2
					if (
						moment(clock.clockTime, fStr)
							.utc()
							.isBetween(moment(employeeInfo.periodEndDate, fStr).utc().subtract(6, 'days'), moment(employeeInfo.periodEndDate, fStr).utc().add(1, 'days').subtract(1, 'seconds'))
					) {
						timeCard2.push([tempClockCycle.date, tempClockCycle.start, tempClockCycle.end, tempClockCycle.hours]);
						timeCard2Total += parseFloat(tempClockCycle.hours);
					}
					tempClockCycle = { date: null, start: null, end: null, hours: null };
				}
				step++;
			});
			if (data.length % 2 === 1) {
				var clock = data[data.length - 1];
				var tempClockCycle = { date: null, start: null, end: null, hours: null };
				tempClockCycle.date = moment(clock.clockTime, fStr).utc().format('MM/DD/YY');
				tempClockCycle.start = roundToNearestXXMinutes(moment(clock.clockTime, fStr).utc(), 15).format('h:mm a');
				tempClockCycle.end = '';
				tempClockCycle.hours = moment
					.duration(roundToNearestXXMinutes(moment().subtract(4, 'hours'), 15).diff(roundToNearestXXMinutes(moment(clock.clockTime, fStr).utc(), 15)))
					.asHours()
					.toFixed(2);
				// if week 1
				if (
					moment(clock.clockTime, fStr)
						.utc()
						.isBetween(moment(employeeInfo.periodStartDate, fStr).utc(), moment(employeeInfo.periodEndDate, fStr).utc().subtract(6, 'days').subtract(1, 'seconds'))
				) {
					timeCard1.push([tempClockCycle.date, tempClockCycle.start, tempClockCycle.end, tempClockCycle.hours]);
					timeCard1Total += parseFloat(tempClockCycle.hours);
				}
				// if week 2
				if (
					moment(clock.clockTime, fStr)
						.utc()
						.isBetween(moment(employeeInfo.periodEndDate, fStr).utc().subtract(6, 'days'), moment(employeeInfo.periodEndDate, fStr).utc().add(1, 'days').subtract(1, 'seconds'))
				) {
					timeCard2.push([tempClockCycle.date, tempClockCycle.start, tempClockCycle.end, tempClockCycle.hours]);
					timeCard2Total += parseFloat(tempClockCycle.hours);
				}
			}

			const PDFDocument = require('./pdfkit-tables');

			const doc = new PDFDocument();
			let filename = request.body.filename;
			// Stripping special characters
			filename = encodeURIComponent(filename) + '.pdf';
			// Setting response to 'attachment' (download).
			// If you use 'inline' here it will automatically open the PDF
			response.setHeader('Content-disposition', 'inline; filename="' + employeeInfo.employeeName + '.pdf"');
			response.setHeader('Content-type', 'application/pdf');

			doc.image('./images/logo.png', 70, 70, { width: 50 });
			doc.moveDown();

			doc.font('Helvetica-Bold').text('SL Technology LLC', 130, 70);
			doc.font('Helvetica').text('580 Vally View Dr.', 130, 85);
			doc.text('New Holland, PA, 17557', 130, 100);

			doc.font('Helvetica-Bold').text('Employee: ', 70, 130, { lineBreak: false }).font('Helvetica').text(employeeInfo.employeeName);
			doc.font('Helvetica-Bold')
				.text('Pay Period: ', 300, 130, { lineBreak: false })
				.font('Helvetica')
				.text(
					moment(employeeInfo.periodStartDate, fStr).utc().add(1, 'days').format('MMM Do, YYYY') +
						' - ' +
						moment(employeeInfo.periodEndDate, fStr).utc().add(1, 'days').format('MMM Do, YYYY')
				);

			doc.moveDown().moveDown();

			const table1 = {
				headers: ['Date', 'Start Time', 'End Time', 'Duration'],
				rows: timeCard1,
			};
			doc.table(
				table1,
				{
					prepareHeader: () => doc.font('Helvetica-Bold'),
					prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
				},
				350
			);

			doc.fontSize(12)
				.font('Helvetica-Bold')
				.text('Weekly Total Hours: ', doc.x + 300, doc.y, { lineBreak: false })
				.font('Helvetica')
				.text(timeCard1Total.toFixed(2));

			doc.moveDown();

			const table2 = {
				headers: ['Date', 'Start Time', 'End Time', 'Duration'],
				rows: timeCard2,
			};
			doc.table(
				table2,
				{
					prepareHeader: () => doc.font('Helvetica-Bold'),
					prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
				},
				350
			);

			doc.fontSize(14)
				.font('Helvetica-Bold')
				.text('Total Hours: ', doc.x + 300, doc.y, { lineBreak: false })
				.font('Helvetica')
				.text((timeCard1Total + timeCard2Total).toFixed(2));

			doc.moveDown().moveDown().moveDown();

			var currentX = 70;
			var currentY = doc.y;

			doc.fontSize(8);
			doc.font('Helvetica').text('Employee Signature', currentX, currentY + 3);
			doc.moveTo(currentX, currentY)
				.lineTo(currentX + 325, currentY)
				.stroke();
			doc.font('Helvetica').text('Date', currentX + 350, currentY + 3);
			doc.moveTo(currentX + 350, currentY)
				.lineTo(currentX + 470, currentY)
				.stroke();

			var currentY = currentY + 60;

			doc.font('Helvetica').text('Supervisor Signature', currentX, currentY + 3);
			doc.moveTo(currentX, currentY)
				.lineTo(currentX + 325, currentY)
				.stroke();
			doc.font('Helvetica').text('Date', currentX + 350, currentY + 3);
			doc.moveTo(currentX + 350, currentY)
				.lineTo(currentX + 470, currentY)
				.stroke();

			doc.pipe(response);
			doc.end();
		} catch (error) {
			console.error(error.message);
			response.status(500).send(error);
		}
	};

	return module;
};

function roundToNearestXXMinutes(start, roundTo) {
	let remainder = roundTo - ((start.minute() + start.second() / 60) % roundTo);
	remainder = remainder > roundTo / 2 ? (remainder = -roundTo + remainder) : remainder;
	const changedDate = moment(start).add(remainder, 'minutes');

	return changedDate;
}
