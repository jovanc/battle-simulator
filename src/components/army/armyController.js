const express = require('express');

const router = express.Router();
const { Army, attackStrategyEnums, Battle } = require('../../models');
const error = require('../../middlewares/errorHandling/errorConstants');
const { minUnits, maxUnits } = require('../../configuration/globalSettings');

const { catchAsyncError } = require('../../middlewares/errorHandling/catchAsynchError');


async function addArmy(req, res) {
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
}

// TODO: TEST THIS METHOD FILTERS
async function getListOfArmies(req, res) {
	const {
		skip = 0, isAlive, name, startUnits, leftUnitsMoreThen, leftUnitsLessThen, attackStrategy,
	} = req.query;
	let { limit } = req.query;

	if (parseInt(limit, 10) > 100 || !limit) {
		limit = 100;
	}

	const query = {};
	if ((isAlive !== undefined || isAlive !== '') && ['true', 'false'].includes(isAlive)) {
		query.isAlive = isAlive;
	}

	if (name) {
		query.name = { $regex: new RegExp(name, 'gi') };
	}

	if (startUnits) {
		query.startUnits = startUnits;
	}

	if (attackStrategy && attackStrategyEnums.includes(attackStrategy)) {
		query.attackStrategy = attackStrategy;
	}

	if (leftUnitsMoreThen && leftUnitsLessThen) {
		query.leftUnits = { $gt: leftUnitsMoreThen, $lt: leftUnitsLessThen };
	} else if (leftUnitsMoreThen) {
		query.leftUnits = { $gt: leftUnitsMoreThen };
	} else if (leftUnitsLessThen) {
		query.leftUnits = { $lt: leftUnitsLessThen };
	}

	const [armiesList, totalCount] = await Promise.all([
		Army.find(query)
			.skip(parseInt(skip, 10))
			.limit(parseInt(limit, 10))
			.lean(),
		Army.countDocuments(query),

	]);

	return res.status(200).send({
		message: 'Successfully got army list',
		results: armiesList,
		totalCount,
	});
}

async function getArmyDetail(req, res) {
	const { armyId } = req;

	const results = await Army.findOne({ _id: armyId }).lean();

	return res.status(200).send({
		message: 'Successfully got army detatils',
		results,
	});
}

// Router for armies

router
	.post('/army', catchAsyncError(addArmy))
	.get('/army/:armyId', catchAsyncError(getArmyDetail))
	.get('/army', catchAsyncError(getListOfArmies));

module.exports = router;
