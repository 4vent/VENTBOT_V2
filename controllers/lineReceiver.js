'use strict'
require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger();
const commandsJson = require('../json/lineCommands.json');

const { askPermission } = require('../helpers/permissionSystem')
const { sendMessage } = require('../helpers/sendLineMessages')

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
    const cmdString = event.message.text;
    const cmdArgs = cmdString.match(/"(\\["ntr\\]|[^"])*"|[^ ]+/g);
    searchLineCommand(cmdArgs, commandsJson, 0, event);
}

// function searchLineCommand(args, cmdsJSON, i, event){ // 再帰関数
//     if(!args[i] in cmdsJSON){
//         // コマンド引数のi番目がcmdsJSONに含まれなければコマンド探索失敗。初回探索なら失敗メッセージを送る。
//         if(i == 0) sendMessage(event.replyToken, 'コマンドが見つかりません。1');
//         return false;
//     }else{
//         // コマンド引数が含まれていれば、次の階層を探索する。
//         const nextLevel = searchLineCommand(args, cmdsJSON[args[i]], i+1, event);
//         if(!nextLevel){
//             // 次の階層の探索に失敗すれば、今の階層に$function要素が含まれるか調べる。
//             if(!'$function' in cmdsJSON[args[i]]){
//                 // なければ探索失敗
//                 if(i == 0) sendMessage(event.replyToken, 'コマンドが見つかりません。2');
//                 return false;
//             }else{
//                 // あればコマンド実行
//                 try{
//                     eval(cmdsJSON[args[i]]['$function'] + '(args, event)');
//                 }catch(e){
//                     logger.error(e)
//                 }
//                 return true
//             }
//         }else{
//             // 次の階層の探索に成功すれば、何も言わずに探索成功を返す。
//             return true;
//         }
//     }
// }

function searchLineCommand(args, cmdsJSON, i, event){
    if(i in args && args[i] in cmdsJSON){
        const nextLevel = searchLineCommand(args, cmdsJSON[args[i]], i+1, event);
        if(nextLevel){
            return true;
        }
    }
    if('$function' in cmdsJSON){
        
        if(askPermission(event['source']['userId'], cmdsJSON['$permission'])){
            doLineCommand(args, event, cmdsJSON['$source'], cmdsJSON['$function'])
        }else{
            sendMessage(event['replyToken'], 'コマンドの実行権限がありません。')
        }
        return true;
    }
    return false;
}

function doLineCommand(args, event, source, functionString){
    try{
        eval(`require("${source}").` + functionString + '(args, event)');
    }catch(e){
        logger.error('\n' + e);
        return false;
    }
    return true;
}

exports.identifyLineWebhookType = identifyLineWebhookType;