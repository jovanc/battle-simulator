const { createNewBattle } = require('../test-TODO/helpers');
require('../src/configuration/databaseConnection');

//* Script to creating fake armies */
//* NODE_ENV=development node scripts/createNewBattle.js 15   => create new battle with 15 opponents in Development
//* If no argument, number of opponents will be minimum number of armies to start battle

const limitArmies = process.argv[2];

createNewBattle(limitArmies).then((res) => {
	console.log(`Successfully created Battle in status: "New", with ${res.opponents.length} armies`);
	process.exit();
}).catch((err) => {
	console.log('Ooops! Some kind of error', err);
	process.exit();
});
