const { Army, attackStrategyEnums } = require('../../models');
const error = require('../../middlewares/errorHandling/errorConstants');


module.exports.addArmy = async (req, res) => {
  const { name, units, attackStrategy } = req.body;

  if (!name || !units || !attackStrategy) throw new Error(error.MISSING_PARAMETERS);

  // TODO: Check if battle is started

  const existingArmy = await Army.findOne({ name }).lean();

  if (existingArmy) throw new Error(error.DUPLICATE_INPUT);

  if (!attackStrategyEnums.includes(attackStrategy) || typeof (units) !== 'number') {
    throw new Error(error.INVALID_VALUE);
  }

  if (units < 80 || units > 100) throw new Error(error.NOT_ACCEPTABLE);

  const newArmy = await new Army({
    name,
    units,
    attackStrategy,
  }).save();

  return res.status(200).send({
    message: 'Successfully created new army',
    resutls: newArmy,
  });
};
