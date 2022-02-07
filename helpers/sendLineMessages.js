'use strict'
require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger();

const line = require('@line/bot-sdk')
const client = new line.Client({
    channelAccessToken: process.env.LINE_ACCESS_TOKEN
})

async function sendMessage(id, messages) {
    if(!Array.isArray(messages)){
        messages = [messages]
    }

    messages.forEach((_, i) => {
        if(typeof messages[i] == 'string'){
            messages[i] = {
                type: 'text',
                text: messages[i].toString()
            }
        }
    })

    if(id.startsWith('U') || id.length == 33){
        for(let i=0; i<messages.length; i+5){
            const messages5 = messages.splice(i, i+5)
            await client.pushMessage(id, messages5)
        }
    }else if(id.length == 32){
        if(messages.length > 5){
            logger.error('5つ以上のメッセージを返信しようとしています。')
        }else{
            client.replyMessage(id, messages)
        }
    }
}

exports.sendMessage = sendMessage;