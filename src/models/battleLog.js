const mongoose = require('mongoose');

const { Schema } = mongoose;

const BattleLogSchema = new Schema({
	battle: { type: Schema.Types.ObjectId, ref: 'Battle' },
	attacker: { type: Schema.Types.ObjectId, ref: 'Army' },
	opponent: { type: Schema.Types.ObjectId, ref: 'Army' },
	attackDamage: Number,
	reloadTime: Number,
}, { timestamps: true });

module.exports = {
	BattleLog: mongoose.model('BattleLog', BattleLogSchema),
};
