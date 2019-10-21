const mongoose = require('mongoose');
const { Army, Battle } = require('../../models');
const { MONGO_DB } = require('../../configuration/environments');
const { createAttackAndLog } = require('./battleUtils');

// function that create delay
const waitReloadTime = async (time) => {
  await new Promise((resolve) => setTimeout(() => {
    resolve('done');
  }, time));
};

// recursive function that create attacks for single army
async function armyAttack(armyId, battleId) {
  const army = await Army.findOne({ _id: armyId }).lean();
  const reloadTime = 10 * army.leftUnits;
  if (army.leftUnits > 0) {
    await createAttackAndLog(battleId, armyId);
    await waitReloadTime(reloadTime);
    armyAttack(armyId, battleId);
  }
}

async function startBattle(battleId, opponents) {
  opponents.forEach((armyId) => {
    armyAttack(armyId, battleId);
  });
}

// Initiate simulator when battle is in progress
Battle.findOne({ status: 'In-progress' }).lean()
  .then((battle) => {
    if (battle) startBattle(battle._id, battle.opponents);
  })
  .catch((err) => {
    console.log(err);
    process.exit(0);
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
