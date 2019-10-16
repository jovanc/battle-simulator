const mongoose = require('mongoose');

const { Schema } = mongoose;

const battleStatuses = ['In-progress', 'Finished'];

const BattleSchema = new Schema({
  opponents: [{ type: Schema.Types.ObjectId, ref: 'Army' }],
  status: { type: String, enum: battleStatuses },
}, { timestamps: true });

module.exports = {
  Battle: mongoose.model('Battle', BattleSchema),
  battleStatuses,
};
