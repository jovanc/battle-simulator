const { Army, attackStrategyEnums, Battle } = require('../../models');
const error = require('../../middlewares/errorHandling/errorConstants');
const { minUnits, maxUnits } = require('../../globalSettings');


module.exports.addArmy = async (req, res) => {
	const { name, units, attackStrategy } = req.body;

	if (!name || !units || !attackStrategy) {
		throw new Error(error.MISSING_PARAMETERS);
	}

	const isBattleActive = await Battle.findOne({ status: 'In-progress' }).lean();

	if (isBattleActive) {
		throw new Error(error.NOT_ACCEPTABLE);
	}

	const existingArmy = await Army.findOne({ name }).lean();

	if (existingArmy) {
		throw new Error(error.DUPLICATE_INPUT);
	}

	if (!attackStrategyEnums.includes(attackStrategy) || typeof (units) !== 'number') {
		throw new Error(error.INVALID_VALUE);
	}

	if (units < minUnits || units > maxUnits) {
		throw new Error(error.NOT_ACCEPTABLE);
	}

	const newArmy = await new Army({
		name,
		startUnits: units,
		attackStrategy,
	}).save();

	return res.status(200).send({
		message: 'Successfully created new army',
		results: newArmy,
	});
};
