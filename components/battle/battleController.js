const path = require('path');
const { spawn } = require('child_process');

const { Army, Battle, BattleLog } = require('../../models');
const error = require('../../middlewares/errorHandling/errorConstants');

module.exports.startBattle = async (req, res) => {
  const [isBattleActive, armies] = await Promise.all([
    Battle.findOne({ status: 'In-progress' }).lean(),
    Army.find({ isAlive: true }).sort({ createdAt: 1 }).lean(),
  ]);

  if (isBattleActive) throw new Error(error.NOT_ACCEPTABLE);

  if (armies.length >= 10) {
    const battle = await new Battle({
      opponents: [...armies.map((army) => army._id)],
      status: 'In-progress',
    }).save();

    console.log(`Game started at: ${battle.createdAt}`);

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
};


module.exports.resetBattle = async (req, res) => {
  const battle = await Battle.findOne({ status: 'In-progress' }).lean();

  if (!battle) throw new Error(error.NOT_FOUND);

  // this update will manualy kill background running simulator
  // TODO: find better way to kill running child proccess
  await Army.updateMany(
    { _id: { $in: battle.opponents } },
    { $set: { isAlive: false, leftUnits: 0 } },
  );
  // wait max reload time, to stop all attacks - remove this afrer improved kill proccesses
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const armies = await Army.find({ _id: { $in: battle.opponents } }).lean();

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
};

// Method has fileter by battle status ( all (without parameter) or 'In-progress' or 'Finished')
module.exports.getListOfBattles = async (req, res) => {
  const { skip = 0, status } = req.query;
  let { limit } = req.query;

  if (parseInt(limit, 10) > 100 || !limit) limit = 100;

  const query = {};
  if (status) query.status = status;

  const [battleLists, totalCount] = await Promise.all([
    Battle.find(query)
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
};


module.exports.getSpecificBattleLog = async (req, res) => {
  const { battleId } = req.params;
  const { skip = 0 } = req.query;
  let { limit } = req.query;

  if (!battleId) throw new Error(error.MISSING_PARAMETERS);

  if (parseInt(limit, 10) > 250 || !limit) limit = 250;

  const battle = await Battle.findOne({ _id: battleId }).lean();

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
};
