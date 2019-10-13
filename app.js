const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const {
  PORT,
  APP_URL,
  MONGO_DB,
  NODE_ENV,
} = require('./configuration/environments');

const { name: appName } = require('./package.json');
const ErrorHandler = require('./middlewares/errorHandling/errorHandler');
const ArmyRouter = require('./components/army/armyRouter');
const BattleRouter = require('./components/battle/battleRouter');

mongoose.Promise = global.Promise;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create the database connection
mongoose.connect(MONGO_DB, {
  reconnectTries: Number.MAX_VALUE,
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.connection.on('connected', () => {
  console.log(`Mongoose default connection open to ${MONGO_DB}`);
});

// CONNECTION EVENTS
// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose default connection error: ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

// When the connection is open
mongoose.connection.on('open', () => {
  console.log('Mongoose default connection is open');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
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
