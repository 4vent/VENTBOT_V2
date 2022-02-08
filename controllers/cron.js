'use strict'
require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger();
const nodeCron = require('node-cron');
const { checkUpdate } = require('../controllers/narouUpdateChecker')

function setCronSchedule(){
    nodeCron.schedule('0,15,30,45 * * * *', () => {
        checkUpdate();
    })
}

exports.setCronSchedule = setCronSchedule;