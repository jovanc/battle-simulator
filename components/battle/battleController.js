const { Army, Battle, BattleLog } = require('../../models');
const error = require('../../middlewares/errorHandling/errorConstants');

module.exports.startBattle = async (req, res) => {
  const [isBattleActive, armies] = await Promise.all([
    Battle.findOne({ status: 'In-progress' }).lean(),
    Army.find({ isAlive: true }).lean(),
  ]);

  if (isBattleActive) throw new Error(error.NOT_ACCEPTABLE);

  if (armies.length >= 10) {
    const battle = await new Battle({
      opponents: [...armies.map((army) => army._id)],
      status: 'In-progress',
    }).save();

    console.log(`Game started at: ${battle.createdAt}`);

    // TODO: Missing game logic - started some part in battleUtils file
    // call game simulator

    return res.status(200).send({
      message: 'Successfully started game',
      results: battle,
    });
  }
  throw new Error(error.NOT_ACCEPTABLE);
};

module.exports.resetBattle = async (req, res) => {
  const { battleId } = req.params;

  const battle = await Battle.findOne({ _id: battleId, status: 'In-progress' }).lean();

  if (!battle) throw new Error(error.NOT_FOUND);

  const armies = await Army.find({ _id: { $in: battle.opponents } }).lean();

  const toExecute = [];

  toExecute.push(Battle.findOneAndUpdate({ _id: battleId }, { $set: { createdAt: new Date() } }).lean());

  armies.forEach((army) => {
    toExecute.push(Army.updateOne({ _id: army._id }, { $set: { leftUnits: army.startUnits, isAlive: true } }));
  });

  toExecute.push(BattleLog.deleteMany({ battle: battleId }));

  const [restartedBattle] = await Promise.all(toExecute);

  console.log(`Game restarted at: ${restartedBattle.createdAt}`);

  // TODO: Missing game logic - started some part in battleUtils file
  // call game simulator

  return res.status(200).send({
    message: 'Successfully restarted game',
    results: restartedBattle,
  });
};

/**
 * I added this method, because client should choose which battle log to get.
 * This is not specified by task request, but in my oppinion it is necessary.
 */
module.exports.getListOfBattles = async (req, res) => {
  const { skip = 0, status } = req.query;
  let { limit } = req.query;

  if (parseInt(limit, 10) > 100) limit = 100;

  const query = {};
  if (status) query.status = status;

  const [battleLists, totalCount] = await Promise.all([
    Battle.find(query)
      .skip(parseInt(skip, 10))
      .limit(parseInt(skip, 10))
      .lean(),
    Battle.countDocuments(query),
  ]);

  return res.status(200).send({
    message: 'Successfully got battles list',
    results: battleLists,
    totalCount,
  });
};


module.exports.getSpecificBattleLog = async (req, res) => {
  const { battleId } = req.params;
  const { skip = 0 } = req.query;
  let { limit } = req.query;

  if (!battleId) throw new Error(error.MISSING_PARAMETERS);

  if (parseInt(limit, 10) > 1000) limit = 1000;

  const [battleInfo, battleLogs, totalCount] = await Promise.all([
    Battle.findOne({ _id: battleId }).lean(),
    BattleLog.find({ battle: battleId })
      .populate('attacker', '_id name')
      .populate('opponent', '_id name')
      .skip(parseInt(skip, 10))
      .limit(parseInt(skip, 10))
      .lean(),
    BattleLog.countDocuments({ battle: battleId }),
  ]);

  return res.status(200).send({
    message: 'Successfully got battle log',
    results: battleLogs,
    totalCount,
    battleInfo,
  });
};
