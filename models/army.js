const mongoose = require('mongoose');

const { Schema } = mongoose;

const attackStrategyEnums = ['Random', 'Weakest', 'Strongest'];

const ArmySchema = new Schema({
  name: { type: String, unique: true },
  startUnits: Number,
  leftUnits: { type: Number, default: this.units },
  attackStrategy: { type: String, enum: attackStrategyEnums },
  isAlive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
  Army: mongoose.model('Army', ArmySchema),
  attackStrategyEnums,
};
