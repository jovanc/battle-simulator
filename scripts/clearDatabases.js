const mongoose = require('mongoose');
const { MONGO_DB } = require('../configuration/environments');
const { Army, BattleLog, Battle } = require('../models');

//* Script to manually cleaning database */
//* NODE_ENV=development node scripts/clearDatabases.js   => Drope all collections in Development


Promise.all([
  Army.deleteMany({}),
  Battle.deleteMany({}),
  BattleLog.deleteMany({}),
]).then(() => {
  console.log(`Successfully deleted:
  - Armies,
  - Battles,
  - Battle logs`);
  process.exit();
}).catch((err) => {
  console.log('Ooops! Some kind of error', err);
  process.exit();
});


// Create the database connection
mongoose.connect(MONGO_DB, {
  reconnectTries: Number.MAX_VALUE,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
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
