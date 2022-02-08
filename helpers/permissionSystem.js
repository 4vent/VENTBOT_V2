'use strict'
const log4js = require('log4js');
const logger = log4js.getLogger('info');

const fs = require('fs');

async function addUser(userId, name){
    const permissionListJSON = fs.readFileSync('./json/permissionList.json');
    const permissionList = JSON.parse(permissionListJSON);
    permissionList[userId] = {
        name: name,
        permission: 1
    }
    fs.writeFileSync('./json/permissionList.json', JSON.stringify(permissionList, null, 2))
}

const permission = {
    admin:         0b1110,
    any:           0b0000,
    noban:         0b0001,
    narou:         0b0010,
    switchbotuser: 0b0100,
    switchbotop:   0b1000,
}

function addPermission(userId, PermissionName){
    const permissionListJSON = fs.readFileSync('./json/permissionList.json');
    const permissionList = JSON.parse(permissionListJSON);
    const userParm = permissionList[userId]['permission'];
    const newUserParm = userParm | permission[PermissionName]
    permissionList[userId]['permission'] = newUserParm;
    fs.writeFileSync('./json/permissionList.json', JSON.stringify(permissionList, null, 2))
}

function removePermission(userId, PermissionName){
    const permissionListJSON = fs.readFileSync('./json/permissionList.json');
    const permissionList = JSON.parse(permissionListJSON);
    const userParm = permissionList[userId]['permission'];
    const newUserParm = userParm & ~permission[PermissionName]
    permissionList[userId]['permission'] = newUserParm;
    fs.writeFileSync('./json/permissionList.json', JSON.stringify(permissionList, null, 2))
}

function askPermission(userId, PermissionName){
    const permissionListJSON = fs.readFileSync('./json/permissionList.json');
    const permissionList = JSON.parse(permissionListJSON);
    const userParm = permissionList[userId]['permission'];
    if((userParm | ~(permission[PermissionName] | permission['noban'])) == -1) return true
    else return false;
}

function findUser(PermissionName){
    const permissionListJSON = fs.readFileSync('./json/permissionList.json');
    const permissionList = JSON.parse(permissionListJSON);
    Object.keys(permissionList).forEach(k => {
        if(permissionList[k]['permission'] == PermissionName){
            return k;
        }
    })
    return false;
}

function findUsers(PermissionName){
    const permissionListJSON = fs.readFileSync('./json/permissionList.json');
    const permissionList = JSON.parse(permissionListJSON);
    let uids = [];
    Object.keys(permissionList).forEach(k => {
        if(permissionList[k]['permission'] == PermissionName){
            uids.push(k);
        }
    })
    if(uids.length != 0) return uids;
    else return false;
    
}

exports.addUser = addUser;
exports.addPermission = addPermission;
exports.removePermission = removePermission;
exports.askPermission = askPermission;
exports.findUser = findUser;
exports.permission = permission;