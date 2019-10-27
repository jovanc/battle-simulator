const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const { spawn } = require('child_process');
const { Battle } = require('./models');

const app = express();
const {
	PORT,
	APP_URL,
	NODE_ENV,
} = require('./configuration/environments');

const { name: appName } = require('../package.json');
const ErrorHandler = require('./middlewares/errorHandling/errorHandler');
const ArmyRouter = require('./components/army/armyController');
const BattleRouter = require('./components/battle/battleController');


mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./configuration/databaseConnection');

Battle.findOne({ status: 'In-progress' }).lean()
	.then((battle) => {
		if (battle) {
			console.log('Continuing unfinished battle');

			// create child proccess that prints messages in main process
			const filePath = path.join(__dirname, 'components/simulator/simulator');
			const child = spawn('node', [filePath, 'child'], { stdio: 'inherit' });

			child.on('exit', () => { console.log('Simulator app closed'); });
			child.on('disconnect', () => { console.log('Simulator app killed or disconnected'); });
			child.on('error', (err) => { console.log('Ooops error happened in simulator app', err); });
		}
	})
	.catch((err) => {
		console.log(err);
		process.exit(0);
	});

app.use('/api/v1', ArmyRouter);
app.use('/api/v1', BattleRouter);

app.use(ErrorHandler());

app.listen(PORT, () => {
	console.log(`__________ ${appName} ____________`);
	console.log(`Server stared in ${NODE_ENV} environment`);
	console.log(`Server URL: ${APP_URL}`);
	console.log('________________________________________');
});

module.exports = app;
