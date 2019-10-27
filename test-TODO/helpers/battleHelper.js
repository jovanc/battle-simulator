const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const { minArmiesForBattle } = require('../../src/configuration/globalSettings');

const { Army, Battle } = require('../../src/models');

// TODO: Helper have bug: => can creat battle with less then minimum armies for battle
const createNewBattle = async (limitArmies = minArmiesForBattle) => {
	let armiesNum = limitArmies;
	if (armiesNum < minArmiesForBattle) {
		armiesNum = minArmiesForBattle;
	}
	const armies = await Army
		.find({ isAlive: true, leftUnits: { $gt: 0 } })
		.limit(parseInt(armiesNum, 10))
		.sort({ createdAt: 1 })
		.lean();

	const opponents = armies.map((army) => ObjectId(army._id));

	const battle = await new Battle({
		status: 'New',
		opponents,
	}).save();

	return battle;
};


module.exports = {
	createNewBattle,
};
