const mongoose = require('mongoose');

const { Schema } = mongoose;

const attackStrategyEnums = ['Random', 'Weakest', 'Strongest'];

const ArmySchema = new Schema({
  name: { type: String, unique: true },
  startUnits: Number,
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
