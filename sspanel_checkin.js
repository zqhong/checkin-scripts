/**
 * SSPANEL面板签到
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 */
const e = require('./env');
const $ = new e.Env('SSPANEL面板自动签到');
const notify = $.isNode() ? require('../sendNotify') : '';
let accounts = $.isNode() ? (process.env.ACCOUNTS ? process.env.ACCOUNTS : '') : ($.getdata('ACCOUNTS') ? $.getdata('ACCOUNTS') : ''),
    apis = $.isNode() ? (process.env.SITE_URL ? process.env.SITE_URL : '') : ($.getdata('SITE_URL') ? $.getdata('SITE_URL') : ''),
    accountList = [],
    apiList = [];
let message = '';
if (accounts.indexOf('&') > -1) {
    accountList = accounts.split('&');
} else {
    accountList = [accounts];
}
if (apis.indexOf('&') > -1) {
    apiList = apis.split('&');
} else {
    apiList = [apis];
}

!(async () => {
    if (!accounts) {
        console.log('请设置环境变量')
        return;
    }
    for (let i = 0; i < accountList.length; i++) {
        $.index = i + 1;
        $.email = accountList[i].trim().split(',')[0];
        $.pwd = accountList[i].trim().split(',')[1];
        $.SSPANEL_API = apiList[i].trim().split('&')[0];
        console.log(`\n*****开始第【${$.index}】个网站****\n`);
        await main();
        await $.wait(2000)
    }
    await sendMsg();
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

async function main() {
    await login();
    await $.wait(2000)
    await checkin();
}

function sendMsg() {
    return new Promise(async resolve => {
        if (message) {
            await notify.sendNotify(`${$.name}`, `${message}`);
            resolve();
            return;
        }
        resolve()
    })
}

/**
 * 签到
 *
 * @returns {*}
 */
function checkin() {
    console.log('开始进行签到...\n');
    return new Promise((resolve) => {
        $.post(sendPost('user/checkin', ''), (err, response, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}\n签到 API 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    message += `第【${$.index}】个网站\n`;
                    if (data.ret === 1) {
                        if (data.trafficInfo) {
                            console.log(`签到${data.msg}\n【今日已用】${data.trafficInfo.todayUsedTraffic}\n【过去已用】${data.trafficInfo.lastUsedTraffic}\n【剩余流量】${data.trafficInfo.unUsedTraffic}\n`)
                            message += `签到${data.msg}\n\n【今日已用】${data.trafficInfo.todayUsedTraffic}\n【过去已用】${data.trafficInfo.lastUsedTraffic}\n【剩余流量】${data.trafficInfo.unUsedTraffic}\n`
                        } else {
                            console.log(`签到${data.msg}\n`)
                            message += `签到${data.msg}\n\n`;
                        }
                    } else {
                        console.log(data.msg, '\n');
                        message += data.msg + '\n\n';
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 登录
 *
 * @returns {*}
 */
function login() {
    return new Promise((resolve) => {
        $.post(sendPost('auth/login', `email=${$.email}&passwd=${$.pwd}&code=`), (err, response, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}\n登录 API 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    console.log(data.msg, '\n');
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

function sendPost(path, body = {}) {
    return {
        url: `${$.SSPANEL_API}/${path}`,
        body: body,
        headers: {
            "Accept": " application/json, text/javascript, */*; q=0.01",
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-requested-with": "XMLHttpRequest",
            "Origin": `${$.SSPANEL_API}`,
            "Referer": `${$.SSPANEL_API}`,
            "Accept-encoding": "gzip, deflate, br",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        }
    }
}
