const { createManyArmies } = require('../test-TODO/helpers');
require('../src/configuration/databaseConnection');

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
