const { Army, BattleLog, Battle } = require('../src/models');
require('../src/configuration/databaseConnection');


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
