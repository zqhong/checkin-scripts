/**
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2023/11/21 09:13
 * @last Modified by sudojia
 * @last Modified time 2023/12/5 21:42
 * @description Steam 游玩时长查询
 */
const $ = new require('./env').Env('Steam游玩时长查询');
const notify = $.isNode() ? require('./sendNotify') : '';
let STEAM_TOKEN = process.env.STEAM_TOKEN, STEAM_64_ID = process.env.STEAM_64_ID, message = '';
const STEAM_API = 'http://api.steampowered.com';
!(async () => {
    if (!STEAM_TOKEN) {
        console.log('请先设置环境变量【STEAM_TOKEN】')
        return;
    }
    if (!STEAM_64_ID) {
        console.log('请先设置环境变量【STEAM_64_ID】')
        return;
    }
    await main();
    await $.wait(1000);
    if (message) {
        await notify.sendNotify(`${$.name}`, `${message}`);
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

async function main() {
    await getUser();
    await $.wait(800);
    await selectSteamTime();
}

/**
 * 获取 Steam 用户名 https://developer.valvesoftware.com/wiki/Steam_Web_API
 * @returns {Promise<unknown>}
 */
function getUser() {
    return new Promise((resolve) => {
        $.get(sendGet('ISteamUser/GetPlayerSummaries/v0002/?key=' + STEAM_TOKEN + '&steamids=' + STEAM_64_ID), (error, response, data) => {
            try {
                if (error) {
                    console.log(`API 请求失败\n请正确输入STEAM_TOKEN和STEAM_64_ID\n以为输出错误信息\n${JSON.stringify(error)}`)
                } else {
                    data = JSON.parse(data);
                    // 获取用户名
                    let personaName = data.response.players[0].personaname;
                    // 获取当前状态
                    let getPersonaState = data.response.players[0].personastate;
                    // 默认为离线
                    // 0: 离线 如果玩家的个人资料是私人的，则该值将始终为 "0"
                    // 除非用户已将其状态设置为寻求交易或寻求玩游戏，因为即使个人资料是私人的，错误也会导致这些状态出现。
                    let personaState = '离线';
                    if (getPersonaState === 1) {
                        personaState = '在线';
                    } else if (getPersonaState === 2) {
                        personaState = '忙碌';
                    } else if (getPersonaState === 3) {
                        personaState = '离开';
                    } else if (getPersonaState === 4) {
                        personaState = '暂停';
                    } else if (getPersonaState === 5) {
                        personaState = '想要交易';
                    } else if (getPersonaState === 6) {
                        personaState = '想要玩';
                    }
                    // 获取 Steam 个人主页 URL
                    let profileUrl = data.response.players[0].profileurl;
                    // 获取当前正在游玩的游戏
                    let gameExtrainfo = data.response.players[0].gameextrainfo == null ? '当前没有在游玩' : '当前正在游玩【' + data.response.players[0].gameextrainfo + '】';
                    message += '用户名【' + personaName + '】\n状态【' + personaState + '】\n主页：' + profileUrl + '\n' + gameExtrainfo + '\n'
                }
            } catch (error) {
                $.logErr(error, response);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 获取游玩时长
 * @returns {Promise<unknown>}
 */
function selectSteamTime() {
    return new Promise((resolve) => {
        $.get(sendGet('IPlayerService/GetRecentlyPlayedGames/v1?key=' + STEAM_TOKEN + '&steamid=' + STEAM_64_ID), (error, response, data) => {
            try {
                if (error) {
                    console.log(`API 请求失败\n请正确输入STEAM_TOKEN和STEAM_64_ID\n以为输出错误信息\n${JSON.stringify(error)}`)
                } else {
                    data = JSON.parse(data);
                    $.gamesList = data.response.games;
                    message += '\n================游玩时长详情================'
                    for (let g of $.gamesList) {
                        // 获取总时长 分钟 / 60 = 小时
                        let playtime_minute = g.playtime_forever / 60
                        // 数据处理, 返回小时
                        let playtime_hour = playtime_minute.toFixed(1)
                        // 获取游戏名
                        let game_name = g.name;
                        message += '\n游戏名【' + game_name + '】\n总时长:' + playtime_hour + ' h' + '\n======';
                    }
                }
            } catch (error) {
                $.logErr(error, response);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 封装 HTTP GET 请求
 * @param path
 * @returns {{headers: {}, url: string}}
 */
function sendGet(path) {
    return {
        url: `${STEAM_API}/${path}`, headers: {}
    }
}