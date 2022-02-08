'use strict';
require('dotenv').config();

const Line = require('@line/bot-sdk');
const client = new Line.Client({
    channelAccessToken: process.env.LINE_ACCESS_TOKEN
})

function lineAppender(config, layout) {
    return (loggingEvent) => {
        const messages = [{
            type: "text",
            text: "[FROM LOG4JS]\n" + `${layout(loggingEvent, config.timezoneOffset)}\n`
        }];

        client.pushMessage(config.userid, messages);
    };
}

function configure(config, layouts) {
    let layout = layouts.basicLayout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }

    return lineAppender(config, layout);
}

module.exports.configure = configure;