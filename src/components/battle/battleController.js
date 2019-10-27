const express = require('express');

const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
// TODO: delete
const { catchAsyncError } = require('../../middlewares/errorHandling/catchAsynchError');

const { Army, Battle, BattleLog } = require('../../models');
const error = require('../../middlewares/errorHandling/errorConstants');
const { minArmiesForBattle } = require('../../configuration/globalSettings');


async function createBattle(req, res) {
	const { opponents } = req.body;

	if (!opponents) {
		throw new Error(error.MISSING_PARAMETERS);
	}

	if (!Array.isArray(opponents) || opponents.length < minArmiesForBattle) {
		throw new Error(error.NOT_ACCEPTABLE);
	}

	const armiesFound = await Army.find(
		{ _id: { $in: opponents }, isAlive: true, leftUnits: { $gt: 0 } }
	).sort({ createdAt: 1 }).lean();

	if (armiesFound.length !== opponents.length) {
		throw new Error(error.NOT_ACCEPTABLE);
	}

	// TODO: maybe few more IFs, but this will do for now.

	const createdBattle = await new Battle({
		opponents: armiesFound.map((army) => army._id),
		status: 'New',
	}).save();

	return res.status(200).send({
		message: 'Successfully started game',
		results: createdBattle,
	});
}


async function startBattle(req, res) {
	const { battleId } = req.params;

	let battle = await Battle.findOne({ _id: battleId, status: 'New' }).lean();

	if (!battle) {
		throw new Error(error.NOT_FOUND);
	}

	const armies = await Army.find({ _id: { $in: battle.opponents }, isAlive: true })
		.sort({ createdAt: 1 }).lean();

	if (armies.length >= minArmiesForBattle) {
		battle = await Battle.findOneAndUpdate(
			{ _id: battleId },
			{ $set: { status: 'In-progress' } },
			{ new: true }
		).lean();

		console.log(`Game started at: ${battle.updatedAt}`);

		// create child proccess that prints messages in main process
		const filePath = path.join(__dirname, '../simulator/simulator');
		const child = spawn('node', [filePath, 'child'], { stdio: 'inherit' });

		child.on('exit', () => { console.log('Simulator app closed'); });
		child.on('disconnect', () => { console.log('Simulator app killed or disconnected'); });
		child.on('error', (err) => { console.log('Ooops error happened in simulator app', err); });

		return res.status(200).send({
			message: 'Successfully started game',
			results: battle,
		});
	}
	throw new Error(error.NOT_ACCEPTABLE);
}


async function resetBattle(req, res) {
	const { battleId } = req.params;
	const battle = await Battle.findOne({ _id: battleId }).lean();

	if (!battle) {
		throw new Error(error.NOT_FOUND);
	}

	// stop simulator process running
	if (battle.status === 'In-progress') {
		process.kill(battle.processId);
	} else {
		await Battle.updateOne({ _id: battleId }, { $set: { status: 'In-progress' } });
	}

	const armies = await Army.find({ _id: { $in: battle.opponents } }).sort({ createdAt: 1 }).lean();

	const toExecute = [];

	toExecute.push(Battle.findOneAndUpdate(
		{ _id: battle._id },
		{ $set: { createdAt: new Date() } },
	).lean());

	armies.forEach((army) => {
		toExecute.push(Army.updateOne({ _id: army._id },
			{ $set: { leftUnits: army.startUnits, isAlive: true } }));
	});

	toExecute.push(BattleLog.deleteMany({ battle: battle._id }));

	const [restartedBattle] = await Promise.all(toExecute);

	console.log(`Game restarted at: ${restartedBattle.createdAt}`);

	// create child proccess that prints messages in main process
	const filePath = path.join(__dirname, '../simulator/simulator');
	const child = spawn('node', [filePath, 'child'], { stdio: 'inherit' });

	child.on('exit', () => { console.log('Simulator app closed'); });
	child.on('disconnect', () => { console.log('Simulator app killed or disconnected'); });
	child.on('error', (err) => { console.log('Ooops error happened in simulator app', err); });

	return res.status(200).send({
		message: 'Successfully restarted game',
		results: restartedBattle,
	});
}

// Method has filter by battle status ( all (without parameter) or 'New' or 'In-progress' or 'Finished')
async function getListOfBattles(req, res) {
	const { skip = 0, status } = req.query;
	let { limit } = req.query;

	if (parseInt(limit, 10) > 100 || !limit) {
		limit = 100;
	}

	const query = {};
	if (status) {
		query.status = status;
	}

	const [battleLists, totalCount] = await Promise.all([
		Battle.find(query)
			.sort({ createdAt: -1 })
			.skip(parseInt(skip, 10))
			.limit(parseInt(limit, 10))
			.lean(),
		Battle.countDocuments(query),
	]);

	return res.status(200).send({
		message: 'Successfully got battles list',
		results: battleLists,
		totalCount,
	});
}


async function getSpecificBattleLog(req, res) {
	const { battleId } = req.params;
	const { skip = 0 } = req.query;
	let { limit } = req.query;

	if (!battleId) {
		throw new Error(error.MISSING_PARAMETERS);
	}

	if (parseInt(limit, 10) > 250 || !limit) {
		limit = 250;
	}

	const battle = await Battle
		.findOne({ _id: battleId })
		.populate('winner', '_id name startUnits leftUnits attackStrategy')
		.lean();

	const [armies, battleLogs, totalCount] = await Promise.all([
		Army.find({ _id: { $in: battle.opponents } }).lean(),
		BattleLog.find({ battle: battleId })
			.populate('attacker', '_id name')
			.populate('opponent', '_id name')
			.skip(parseInt(skip, 10))
			.limit(parseInt(limit, 10))
			.lean(),
		BattleLog.countDocuments({ battle: battleId }),
	]);

	return res.status(200).send({
		message: 'Successfully got battle log',
		battle,
		armies,
		battleLogs,
		totalCount,
	});
}

// Router for battles

router
	.post('/battle', catchAsyncError(createBattle))
	.patch('/battle/:battleId/start', catchAsyncError(startBattle))
	.patch('/battle/:battleId/reset', catchAsyncError(resetBattle))
	.get('/battle', catchAsyncError(getListOfBattles))
	.get('/battle/:battleId', catchAsyncError(getSpecificBattleLog));

module.exports = router;
