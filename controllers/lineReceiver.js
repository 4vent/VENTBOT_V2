'use strict'
require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger();
const commandsJson = require('../json/lineCommands.json');

const { showGeneralHelp } = require('../helpers/showHelp');

const { sendMessage } = require('../helpers/sendLineMessages');

function identifyLineWebhookType(MessagingAPIContents){
    MessagingAPIContents.events.forEach(e => {
        switch (e.type){
        case 'message':
            identifyLineMessageType(e);
            break;
        default:
            logger.warn('Unknown type webhook event\n[event]\n' + JSON.stringify(e, null, 2));
        }
    })
    // console.log(JSON.stringify(MessagingAPIContents, null, 2))
}

function identifyLineMessageType(event){
    switch (event.message.type){
    case 'text':
        if(event.message.text.startsWith('!')) identifyLineCommand(event);
        break;
    default:
        logger.warn('Unknown type line message event\n[event]\n' + JSON.stringify(event, null, 2));
    }
}

function identifyLineCommand(event){
    // functionというlineコマンドは作らないこと。
    const cmdString = event.message.text;
    const cmdArgs = cmdString.match(/"(\\["ntr\\]|[^"])*"|[^ ]+/g);
    searchLineCommand(cmdArgs, commandsJson, 0, event);
}

function searchLineCommand(args, cmdsJSON, i, event){
    if(args[i] in cmdsJSON){
        const nextLevel = searchLineCommand(args, cmdsJSON[args[i]], i+1, event);
        if(!nextLevel){
            if('function' in cmdsJSON[args[i]]){
                // console.log('コマンドが見つかりました。:', cmdsJSON[args[i]]['function'])
                try{
                    eval(cmdsJSON[args[i]]['function'] + '(args, event)');
                }catch(e){
                    logger.error(e)
                }
                return true
            }else{
                if(i == 0) sendMessage(event.replyToken, 'コマンドが見つかりません。2');
                return false;
            }
        }else{
            return true;
        }
        // const nextLevel = searchLineCommand(args, cmdsJSON[args[i]], i+1, event);
    }else{
        if(i == 0) sendMessage(event.replyToken, 'コマンドが見つかりません。1')
    }
}

exports.identifyLineWebhookType = identifyLineWebhookType;