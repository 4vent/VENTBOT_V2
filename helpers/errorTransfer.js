'use strict'
const log4js = require('log4js');
const logger = log4js.getLogger('info');

const { sendMessage } = require('../helpers/sendLineMessages');
const { findUser, permission } = require('../helpers/permissionSystem')

exports.sendErrorMessage = sendErrorMessage;

function sendErrorMessage(e){
    const adminUID = findUser('admin');
    sendMessage(adminUID, '[エラー発生]')
}