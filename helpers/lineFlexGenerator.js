const log4js = require('log4js');
const logger = log4js.getLogger('info');



exports.mkNarouListBubble = mkNarouListBubble;
exports.mkNarouNewItem = mkNarouNewItem;
exports.swbotRemocon = swbotRemocon;

function swbotRemocon(deviceName, buttons) {
    const header = {
        type: "box",
        layout: "vertical",
        contents: [
            {
                type: "text",
                text: deviceName,
                weight: "bold",
                size: "xl"
            }
        ]
    }

    var footer = {
        type: "box",
        layout: "vertical",
        contents: [],
        spacing: "sm"
    }

    Object.keys(buttons).forEach(key => {
        const content = {
            type: "button",
            style: buttons[key].style,
            action: {
                type: "postback",
                label: buttons[key].label,
                data: `/sb ${deviceName} ${key}`
            },
            height: "sm"
        };
        footer.contents.push(content);
    })

    const bubble = {
        type: "bubble",
        header: header,
        footer: footer,
        size: "micro"
    }
    return bubble
}

function mkNarouListBubble(novels) {
    var bodycontents = []

    for(i=0; i<novels.length; i++){
        var bodycontent = {
            type: 'box',
            layout: 'horizontal',
            spacing: "sm",
            contents: [
                { type: 'text', text: `[${i}]`, flex: 0 },
                {
                    type: 'text',
                    text: novels[i].title,
                    wrap: true
                }
            ],
            paddingAll: 'md',
            action: { type: 'uri', uri: `https://${(novels[i].isR18)? 'novel18': 'ncode'}.syosetu.com/${novels[i].ncode}/` }
        }
        bodycontents.push({ type: 'separator' });
        bodycontents.push(bodycontent);
    }
        
    const bubble = {
        type: 'bubble',
        header: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '更新通知リスト',
                    size: 'xl',
                    weight: 'bold',
                    align: "center"
                }
            ],
            paddingAll: "md"
        },
        body: {
            type: 'box',
            layout: 'vertical',
            contents: bodycontents,
            paddingAll: '0px'
        }
    }

    return bubble;
}

function mkNarouNewItem(title, trueTitle, url) {
    const bubble = {
        type: 'bubble',
        header: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '更新アリ',
                    size: 'lg',
                    weight: 'bold',
                    align: 'center'
                }
            ],
            paddingAll: 'md'
        },
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                { type: 'text', text: title, size: 'lg', wrap: true },
                {
                    type: 'text',
                    text: trueTitle,
                    color: '#aaaaaa',
                    size: 'sm',
                    wrap: true
                }
            ],
            paddingAll: 'md'
        },
        action: { type: 'uri', label: 'action', uri: url }
    }
    return bubble;
}