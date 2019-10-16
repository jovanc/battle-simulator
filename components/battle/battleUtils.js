const { Army, BattleLog } = require('../../models');


const armyProperties = async (armyId) => {
  const army = await Army.findOne({ _id: armyId, isAlive: true }).lean();

  if (!army) return false;

  if (army.leftUnits <= 0) {
    await Army.updateOne({ _id: armyId }, { $set: { isAlive: false } });
    return false;
  }

  const { leftUnits } = army;

  army.attackChance = Math.random() <= (0.01 * leftUnits);
  army.attackDamage = army.attackChance ? Math.floor(0.5 * leftUnits) : 0;
  army.reloadTime = 0.01 * leftUnits;

  return army;
};

const chooseOpponent = async (attackerArmy) => {
  const armies = await Army
    .find({ _id: { $ne: attackerArmy._id }, isAlive: true, leftUnits: { $gt: 0 } })
    .sort({ leftUnits: 1 })
    .lean();

  if (armies.length <= 1) return false;

  let opponent;
  switch (attackerArmy.attackStrategy) {
    case 'Random':
      opponent = armies[Math.floor(Math.random() * armies.length)];
      break;
    case 'Weakest':
      [opponent] = armies;
      break;
    case 'Strongest':
      opponent = armies[armies - 1];
      break;
    default:
      opponent = false;
      break;
  }
  return opponent;
};

const createAttackAndLog = async (battleId, attacker, opponent) => {
  const { _id, attackDamage, reloadTime } = attacker;

  const [updatedOpponent] = await Promise.all([
    Army.updateOne({ _id: opponent._id }, { $inc: { leftUnits: -attackDamage } }, { new: true }),
    new BattleLog({
      battle: battleId,
      attacker: _id,
      opponent: opponent._id,
      attackDamage,
      reloadTime,
    }).save(),
  ]);

  if (updatedOpponent.leftUnits <= 0) {
    await Army.updateOne({ _id: opponent._id }, { $set: { isAlive: false } });
  }
};

const singleAttack = async (battleId, attackerId) => {
  const attacker = await armyProperties(attackerId);
  if (!attacker) return false;

  const opponent = await chooseOpponent(attacker);
  if (!opponent) return false;

  await createAttackAndLog(battleId, attacker, opponent);
  return true;
};

const startBattle = async (battleId) => {
  // TODO: battle simulation until there is only one army left.
  const armies = await Army.find({ isAlive: true }).lean();
};

module.exports = {
  armyProperties,
  chooseOpponent,
  createAttackAndLog,
  singleAttack,
  startBattle,
};
