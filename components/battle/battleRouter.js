const express = require('express');

const BattleController = require('./battleController');
const { catchAsyncError } = require('../../middlewares/errorHandling/catchAsynchError');

const router = express.Router();

router
  .patch('/battle/start', catchAsyncError(BattleController.startBattle))
  .patch('/battle/pause', catchAsyncError(BattleController.startBattle));

module.exports = router;
