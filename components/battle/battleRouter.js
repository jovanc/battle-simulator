const express = require('express');

const BattleController = require('./battleController');
const { catchAsyncError } = require('../../middlewares/errorHandling/catchAsynchError');

const router = express.Router();

router
  .patch('/battle/start', catchAsyncError(BattleController.startBattle))
  .patch('/battle/:battleId/reset', catchAsyncError(BattleController.resetBattle))
  .get('/battle', catchAsyncError(BattleController.getListOfBattles))
  .get('/battle/:battleId', catchAsyncError(BattleController.getSpecificBattleLog));

module.exports = router;
