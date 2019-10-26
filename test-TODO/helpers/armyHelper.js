const faker = require('faker');

const { Army, attackStrategyEnums } = require('../../src/models');


const createArmy = async ({ name, units, attackStrategy } = {}) => new Army({
	name: name || faker.name.findName(),
	startUnits: units || faker.random.number({ min: 80, max: 100 }),
	attackStrategy: attackStrategyEnums.includes(attackStrategyEnums) ? attackStrategy : faker.random.arrayElement(attackStrategyEnums),
}).save();

const createManyArmies = async ({ number = faker.random.number({ min: 10, max: 100 }) } = {}) => {
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
