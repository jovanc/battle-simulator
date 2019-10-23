const { Army, Battle, BattleLog } = require('../../models');

// get army (state) properties from DB and calculate additional properties
const armyProperties = async (armyId) => {
  const army = await Army.findOne({ _id: armyId, isAlive: true }).lean();

  if (!army) return false;

  if (army.leftUnits <= 0) {
    await Army.updateOne({ _id: armyId }, { $set: { isAlive: false } });
    return false;
  }

  const { leftUnits } = army;

  // returns true or false
  army.attackChance = Math.random() <= (0.01 * leftUnits);

  // It is = 0 if there was no attack chance or whole number of units
  army.attackDamage = army.attackChance ? Math.floor(0.5 * leftUnits) : 0;

  // relode time in ms
  army.reloadTime = 10 * leftUnits;

  return army;
};


// check if there is only one army standing
async function isBattleFinished() {
  const leftArmies = await Army.countDocuments({ isAlive: true, leftUnits: { $gt: 0 } });
  if (leftArmies <= 1) {
    // TODO: Edge case: 2 armies made same time (or really close time) attack and both dead
    // if all armies are dead, return last attack from log, and make one army alive.
    // Delete log, return units to amry ...
    const [winner] = await Promise.all([
      Army.findOne({ isAlive: true }).lean(),
      Battle.updateOne({ status: 'In-progress' }, { $set: { status: 'Finished' } }),
    ]);
    console.log(`Battle finished!
    Winner is: ${winner.name}
    Winner left units: ${winner.leftUnits}`);
    process.exit(0);
    return true;
  }
  return false;
}


// choose opponent by attack strategy or attacker army
const chooseOpponent = async (attackerArmyId, attackerArmyStrategy) => {
  const armies = await Army
    .find({ _id: { $ne: attackerArmyId }, isAlive: true, leftUnits: { $gt: 0 } })
    .sort({ leftUnits: 1 })
    .lean();

  if (armies.length < 1) {
    await isBattleFinished();
    return false;
  }

  let opponent;
  switch (attackerArmyStrategy) {
    case 'Random':
      opponent = armies[Math.floor(Math.random() * armies.length)];
      break;
    case 'Weakest':
      [opponent] = armies;
      break;
    case 'Strongest':
      opponent = armies[armies.length - 1];
      break;
    default:
      opponent = false;
      break;
  }
  return opponent;
};

// make single attack and create attack log.
const createAttackAndLog = async (battleId, attackerId) => {
  const attacker = await armyProperties(attackerId);
  if (!attacker) {
    await isBattleFinished();
    return;
  }
  const { attackDamage, reloadTime, attackStrategy } = attacker;

  const opponent = await chooseOpponent(attackerId, attackStrategy);

  if (!opponent) {
    await isBattleFinished();
    return;
  }

  console.log(`Attacker: ${attacker.name},  Opponent: ${opponent.name},  Attack damage: ${attackDamage}  Attack reload time: ${reloadTime}ms`);
  const [updatedOpponent] = await Promise.all([
    Army.findOneAndUpdate({ _id: opponent._id },
      { $inc: { leftUnits: -attackDamage } }, { new: true }).lean(),
    new BattleLog({
      battle: battleId,
      attacker: attackerId,
      opponent: opponent._id,
      attackDamage,
      reloadTime,
    }).save(),
  ]);

  if (updatedOpponent.leftUnits < 1) {
    await Army.updateOne({ _id: opponent._id }, { $set: { isAlive: false } });
    await isBattleFinished();
  }
};

module.exports = {
  armyProperties,
  chooseOpponent,
  createAttackAndLog,
  isBattleFinished,
};
