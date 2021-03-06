const { Army, Battle, BattleLog } = require('../../models');
const { createAttackAndLog, isBattleFinished } = require('./battleFunctions');
const { attackReloadTimePerUnit } = require('../../configuration/globalSettings');

require('../../configuration/databaseConnection');

// function that create delay for reloading time
async function waitReloadTime(time) {
	await new Promise((resolve) => setTimeout(() => {
		resolve('done');
	}, time));
}

// recursive function that create attacks for single army
async function armyAttack(armyId, battleId) {
	const army = await Army.findOne({ _id: armyId }).lean();
	if (!army) {
		await isBattleFinished();
		return;
	}
	const reloadTime = attackReloadTimePerUnit * army.leftUnits;
	if (army.leftUnits > 0) {
		await isBattleFinished();
		await createAttackAndLog(battleId, armyId);
		await waitReloadTime(reloadTime);

		armyAttack(armyId, battleId);
	}
}

async function startBattle(battleId, opponents) {
	// get lattest attack from battle log in DB (if exist)
	const interruptedBattle = await BattleLog
		.find({ battle: battleId })
		.sort({ createdAt: -1 })
		.limit(1)
		.lean();

	let opponentsList = [];
	if (interruptedBattle.lenght) {
		const index = opponents.indexOf(interruptedBattle.attacker);
		const nextArmyToAttack = index === opponents.lenght - 1 ? 0 : index + 1;
		// change order of armies attacking - continue where battle was interrupted
		for (let i = nextArmyToAttack; i < opponents.lenght; i += 1) {
			opponentsList.push(opponents[i]);
		}
		for (let i = 0; i < nextArmyToAttack; i += 1) {
			opponentsList.push(opponents[i]);
		}
	} else {
		opponentsList = opponents;
	}
	opponentsList.forEach((armyId) => {
		armyAttack(armyId, battleId);
	});
}

// Initiate simulator when battle is in progress
Battle.findOne({ status: 'In-progress' }).lean()
	.then((battle) => {
		// update battle with current process PID - so simulator could be restarted
		Battle.updateOne({ _id: battle._id }, { $set: { processId: process.pid } })
			.then(() => {
				if (battle) {
					startBattle(battle._id, battle.opponents);
				}
			});
	})
	.catch((err) => {
		console.log(err);
		process.exit(0);
	});
