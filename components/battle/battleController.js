const { Battle } = require('../../models');
const error = require('../../middlewares/errorHandling/errorConstants');

module.exports.startBattle = async (req, res) => {
  console.log('Start a game');
  return res.status(200).send({
    message: 'Success',
  });
};

/**
 * I added this method, because client should choose which battle log to get.
 * This is not specified by task request, but in my oppinion it is necessary.
 */
module.exports.getListOfBattles = async (req, res) => {
  console.log('getListOfBattles');

  return res.status(200).send({
    message: 'Success',
  });
};

module.exports.getSpecificBattleLog = async (req, res) => {
  const { battleId } = req.query;

  if (!battleId) throw new Error(error.MISSING_PARAMETERS);

  console.log('getSpecificBattleLog');

  return res.status(200).send({
    message: 'Success',
  });
};
