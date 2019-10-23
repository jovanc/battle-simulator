const mongoose = require('mongoose');
const { MONGO_DB } = require('../configuration/environments');
const { createManyArmies } = require('../test-TODO/helpers');

//* Script to creating fake armies */
//* NODE_ENV=development node scripts/createFakeArmies.js 15   => create 15 armies in Development
//* If no argument, random number of armies will be created

const number = process.argv[2];

createManyArmies({ number }).then((res) => {
  console.log(`Successfully created ${res.length} armies`);
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
