const express = require('express');

const ArmyController = require('./armyController');
const { catchAsyncError } = require('../../middlewares/errorHandling/catchAsynchError');

const router = express.Router();

router
	.post('/army', catchAsyncError(ArmyController.addArmy));

module.exports = router;
