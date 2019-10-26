const faker = require('faker');
const { minUnits, maxUnits, minArmiesForBattle } = require('../../src/globalSettings');

const { Army, attackStrategyEnums } = require('../../src/models');


const createArmy = async ({ name, units, attackStrategy } = {}) => new Army({
	name: name || faker.name.findName(),
	startUnits: units || faker.random.number({ min: minUnits, max: maxUnits }),
	attackStrategy: attackStrategyEnums.includes(attackStrategyEnums) ? attackStrategy : faker.random.arrayElement(attackStrategyEnums),
}).save();

const createManyArmies = async ({ number = faker.random.number({ min: minArmiesForBattle, max: 10 * minArmiesForBattle }) } = {}) => {
	const toExecute = [];
	for (let i = 1; i <= number; i += 1) {
		toExecute.push(createArmy());
	}
	const armies = await Promise.all(toExecute);
	return armies;
};

module.exports = {
	createArmy,
	createManyArmies,
};
