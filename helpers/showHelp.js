'use strict'
require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger();

const { sendMessage } = require('./sendLineMessages')

function showGeneralHelp(args, event){
    const message = [
        "VENTBOT V2\n",
        "コマンドヘルプ\n",
        "ーーーーーーー\n",
        "!h ヘルプを表示",
    ]
    sendMessage(event.replyToken, message.join(""))
}

exports.showGeneralHelp = showGeneralHelp