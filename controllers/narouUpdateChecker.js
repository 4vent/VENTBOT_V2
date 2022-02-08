require('dotenv').config();
const log4js = require('log4js');
const logger = log4js.getLogger('info');

const https = require('https');
const fs = require('fs');

const { sendMessage } = require('../helpers/sendLineMessages');
const { mkNarouListBubble, mkNarouNewItem } = require('../helpers/lineFlexGenerator');

exports.showNarouHelp = showNarouHelp;
exports.regNovel = regNovel;
exports.listNovels = listNovels;
exports.editNovel = editNovel;
exports.delNovel = delNovel;
exports.checkUpdate = checkUpdate;

const infoTextLines = [
    "なろうコマンドヘルプ",
    "",
    "/n reg <url||n_code>: 登録",
    "/n list: 一覧",
    "/n edit <num> name <newname>: 名前変更",
    "/n edit <num> reset: 再登録",
    "/n del <num>: 削除(numはlistで確認)",
    "/n fu: force update"
];
var infoText = infoTextLines.join('\n')

function showNarouHelp(cmdArgV, event){
    const replyToken = event.replyToken;
    sendMessage(replyToken, infoText);
}


function identifyNarouCommand(cmdArgV, event) {
    const replyToken = event.replyToken;
    
    if (cmdArgV[0] != '!n') logger.error('program error: something not narou command is passed to narou tools.')
    else if (cmdArgV.length === 1) sendMessage(replyToken, {type: "text", text: infoText});
    else {
        switch(cmdArgV[1]){
        case 'reg':
            if (cmdArgV.length < 3) sendMessage(replyToken, {type: "text", text: "引数を確認。使い方:\n   /n reg <url||n_code>"});
            else regNovel(replyToken, cmdArgV);
            break;
        case 'list':
            listNovels(replyToken);
            break;
        case 'edit':
            if (cmdArgV.length < 4) sendMessage(replyToken, {type: "text", text: "引数を確認。使い方:\n   /n reg <url||n_code>"});
            else editNovel(replyToken, cmdArgV);
            break;
        case 'del':
            if (cmdArgV.length < 3) sendMessage(replyToken, {type: "text", text: "引数を確認。使い方:\n   /n reg <url||n_code>"});
            else delNovel(replyToken, cmdArgV);
            break;
        case 'fu':
            checkUpdate();
            break;
        default:
            sendMessage(replyToken, {type: "text", text: infoText});
        }
    }
}

async function regNovel(cmdArgV, event) {
    const replyToken = event.replyToken;
    const ncode = cmdArgV[2].match(/n[0-9][0-9][0-9][0-9][a-z][a-z]/g)

    if(ncode === null || ncode.length != 1) sendMessage(replyToken, {type: "text", text: 'ncode読み取りエラー'});
    else {
        const narouRequestResult = await getDescriptionbyNcode(ncode[0]);
        if(narouRequestResult.status === 'faild'){
            sendMessage(replyToken, {type: "text", text: "小説の取得に失敗しました。"})
        }else if(narouRequestResult.status === 'success'){
            const narou_item = {
                title: narouRequestResult.title,
                general_all_no: narouRequestResult.general_all_no,
                ncode: narouRequestResult.ncode,
                isR18: narouRequestResult.isR18
            }
            const narou_list = JSON.parse(fs.readFileSync('./json/narou_checklist.json', 'utf-8'));
            narou_list.novels.push(narou_item)
            fs.writeFileSync('./json/narou_checklist.json', JSON.stringify(narou_list, null, '    '));
            sendMessage(replyToken, {
                type: "text",
                text: `登録しました。:\ntitle: ${narou_item.title}\n合計話数: ${narou_item.general_all_no}`
            })
        }else{
            sendMessage(replyToken, {type: "text", text: "エラー@narou_tools/regNarou"})
        }
    }
}

async function getDescriptionbyNcode(ncode) {
    const options = {
        host: "api.syosetu.com",
        path: "/novelapi/api/" + `?ncode=${ncode}&out=json&of=t-ga`,
        headers: {'User-Agent': 'Mozilla/5.0'}
    }
    var data = [];
    const narouRequestResult = await new Promise((resolve) => {
        https.get(options, (res) => {
            res.on('data', (chunk) => {
                data.push(chunk)
            });
            res.on('end', async () => {
                const res_json = Buffer.concat(data);
                const description = JSON.parse(res_json)
                if(description[0].allcount === 1) {
                    const narouRequestResultResolve = {
                        status: "success",
                        title: description[1].title,
                        general_all_no: description[1].general_all_no,
                        ncode: ncode,
                        isR18: false
                    }
                    resolve(narouRequestResultResolve);
                }else{
                    resolve(await getDescriptionbyNcodeR18(ncode));
                }
            })
        })
    })
    return narouRequestResult;
}

async function getDescriptionbyNcodeR18(ncode) {
    const options = {
        host: "api.syosetu.com",
        path: "/novel18api/api/" + `?ncode=${ncode}&out=json&of=t-ga`,
        headers: {'User-Agent': 'Mozilla/5.0'}
    }
    var data = [];

    const narouRequestResultR18 = await new Promise((resolve) => {
        https.get(options, (res) => {
            res.on('data', (chunk) => {
                data.push(chunk)
            });
            res.on('end', () => {
                const res_json = Buffer.concat(data);
                const description = JSON.parse(res_json)
                if(description[0].allcount === 1) {
                    const narouRequestResultR18Resolve = {
                        status: "success",
                        title: description[1].title,
                        general_all_no: description[1].general_all_no,
                        ncode: ncode,
                        isR18: true
                    }
                    resolve(narouRequestResultR18Resolve);
                }else{
                    const narouRequestResultR18Resolve = {
                        status: "faild"
                    }
                    resolve(narouRequestResultR18Resolve);
                }
            })
        })
    })

    return narouRequestResultR18;
}

function listNovels(cmdArgV, event) {
    const replyToken = event['replyToken'];
    const novelsList = JSON.parse(fs.readFileSync('./json/narou_checklist.json', 'utf-8'));
    const message = {
        type: "flex",
        altText: "This is a Flex Message",
        contents: mkNarouListBubble(novelsList.novels)
    }
    sendMessage(replyToken, message);
}

function delNovel(cmdArgV, event) {
    const replyToken = event['replyToken'];
    const novelsList = JSON.parse(fs.readFileSync('./json/narou_checklist.json', 'utf-8'));

    if (isNaN(cmdArgV[2])) sendMessage(replyToken, "引数エラー。数値を指定してください。");
    else if (cmdArgV[2] >= novelsList.novels.length || cmdArgV[2] < 0) sendMessage(replyToken, "引数エラー。値の範囲が間違っています。")
    else {
        const title = novelsList.novels[cmdArgV[2]].title;
        novelsList.novels.splice(cmdArgV[2], 1);
        fs.writeFileSync('./json/narou_checklist.json', JSON.stringify(novelsList, null, '    '));
        if(replyToken != null) sendMessage(replyToken, `${title} を削除しました。`);
    }
}

function editNovel(cmdArgV, event) {
    const replyToken = event['replyToken'];
    const novelsList = JSON.parse(fs.readFileSync('./json/narou_checklist.json', 'utf-8'));

    if (isNaN(cmdArgV[2])) sendMessage(replyToken, "引数エラー。数値を指定してください。");
    else if (cmdArgV[2] >= novelsList.novels.length || cmdArgV[2] < 0) sendMessage(replyToken, "引数エラー。値の範囲が間違っています。")
    else {
        switch (cmdArgV[3]){
        case 'name':
            const ptitle = novelsList.novels[cmdArgV[2]].title
            novelsList.novels[cmdArgV[2]]['title'] = cmdArgV[4]
            fs.writeFileSync('./json/narou_checklist.json', JSON.stringify(novelsList, null, '    '))
            sendMessage(replyToken, `名前変更:\n${ptitle}\n        =>\n${cmdArgV[4]}`)
            break;
        case 'reset':
            const ncode = novelsList.novels[cmdArgV[2]]['ncode']
            delNovel(null, cmdArgV);
            regNovel(null, [0, 0, ncode]);
            sendMessage(replyToken, `再登録:\n${novelsList.novels[cmdArgV[2]]['ncode']}`)
        default:
            sendMessage(replyToken, `editコマンドの引数エラー`)
        }
    }
}

async function checkUpdate() {
    const novelsList = JSON.parse(fs.readFileSync('./json/narou_checklist.json', 'utf-8'));
    const groupeslist = JSON.parse(fs.readFileSync('./json/line_groupeid_list.json', 'utf-8'));
    const narou_groupeID = groupeslist.groupeslist.narou_notification;

    sendMessage(narou_groupeID, '強制更新中...');

    novelsList.novels.forEach(async n => {
        const narouApiPath = (n.isR18)? "/novel18api/api/": "/novelapi/api/";
        const options = {
            host: "api.syosetu.com",
            path: narouApiPath + `?ncode=${n.ncode}&out=json&of=t-ga`,
            headers: {'User-Agent': 'Mozilla/5.0'}
        }

        var data = [];
        await new Promise ((resolve) => {
            https.get(options, (res) => {
                res.on('data', (chunk) => {
                    data.push(chunk)
                });
                res.on('end', () => {
                    const rawJson = Buffer.concat(data);
                    const parsedJson = JSON.parse(rawJson)
                    if(parsedJson[0].allcount == 0){
                        resolve();
                    }else if(parsedJson[1].general_all_no > n.general_all_no) {
                        const url = `https://${(n.isR18)? 'novel18': 'ncode'}.syosetu.com/${n.ncode}/${n.general_all_no + 1}/`;
                        const message = {
                            type: "flex",
                            altText: `小説更新あり: ${n.title}`,
                            contents: mkNarouNewItem(n.title, parsedJson[1].title, url)
                        }
                        // {
                        //     type: "text",
                        //     text: `小説更新あり\n${n.title}\nhttps://${(n.isR18)? 'novel18': 'ncode'}.syosetu.com/${n.ncode}/`
                        // }
                        sendMessage(narou_groupeID, message);
                        var processNovelsList = JSON.parse(fs.readFileSync('./json/narou_checklist.json', 'utf-8'));
                        processNovelsList.novels.forEach((n2) => {
                            if(n2.ncode === n.ncode) n2.general_all_no = parsedJson[1].general_all_no;
                        })
                        fs.writeFileSync('./json/narou_checklist.json', JSON.stringify(processNovelsList, null, '    '))
                        resolve();
                    }
                })
            })
        })
    });
    sendMessage(narou_groupeID, '更新完了')
}