const mongoose = require('mongoose');
const { minUnits, maxUnits } = require('../configuration/globalSettings');

const { Schema } = mongoose;

const attackStrategyEnums = ['Random', 'Weakest', 'Strongest'];

const ArmySchema = new Schema({
	name: { type: String, unique: true },
	startUnits: { type: Number, min: minUnits, max: maxUnits },
	leftUnits: Number,
	attackStrategy: { type: String, enum: attackStrategyEnums },
	isAlive: { type: Boolean, default: true },
}, { timestamps: true });

ArmySchema.pre('save', function (next) {
	this.leftUnits = this.startUnits;
	next();
});

module.exports = {
	Army: mongoose.model('Army', ArmySchema),
	attackStrategyEnums,
};
