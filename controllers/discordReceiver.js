'use strict'
require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger();

const { Client } = require('discord.js');
const client = new Client({intents: parseInt('11111111111111', 2)});

// const { sendMessage } = require('../helpers/sendLineMessages');
const { identifyLineWebhookType } = require('./lineReceiver');

async function startDiscord(DISCORD_TOKEN=process.env.DISCORD_TOKEN){
    client.once('ready', () => {
        logger.info('Discord is Ready...');
    });

    client.on('messageCreate', messageCrate => {
        identifyMessageSource(messageCrate);
    });

    client.login(DISCORD_TOKEN);
    return client;
}

const webhookid_line = process.env.DC_WEBHOOKID_LINE;
const webhookid_twitterOAuth = '';

function identifyMessageSource(messageCrate){
    switch(messageCrate.webhookId){
    case webhookid_line:
        // const contentsString = messageCrate.content.replace(/(?<!\\)\\n/g, '\n');
        const contentsString = messageCrate.content;
        identifyLineWebhookType(JSON.parse(contentsString));
        break;
    case webhookid_twitterOAuth:
    default:
        logger.error('Unknown webhook id.\n'+JSON.stringify(messageCrate, null, 2));
    }
}

exports.startDiscord = startDiscord;

// async function main() {
//     const dcClient = await startDiscord();
//     setTimeout(() => {
//         dcClient.destroy();
//     }, 5000)
// }

// main()