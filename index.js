require('dotenv').config();

const log4js = require('log4js');
log4js.configure('json/log4js_config.json');
const logger = log4js.getLogger();
const { startDiscord } = require('./controllers/discordReceiver');
const { setCronSchedule } = require('./controllers/cron');
async function main() {
    startDiscord();
    setCronSchedule();
}

main();