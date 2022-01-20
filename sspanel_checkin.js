/**
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2021/9/25 22:11
 * @last Modified by sudojia
 * @last Modified time 2022/01/20 11:17
 * @description SSPANEL面板自动签到
 */
const $ = new require('./env').Env('SSPANEL面板自动签到');
const notify = $.isNode() ? require('./sendNotify') : '';
let total = process.env.SITE_ACCOUNTS, totalList = [], message = '';

if (total.indexOf('&') > -1) {
    totalList = total.split('&');
} else {
    totalList = [total];
}

!(async () => {
    if (!total) {
        console.log('请先设置环境变量【SITE_ACCOUNTS】')
        return;
    }
    for (let i = 0; i < totalList.length; i++) {
        $.index = i + 1;
        // 网站
        $.SITE_URL = totalList[i].split(',')[0];
        // 邮箱
        $.email = totalList[i].split(',')[1].split(':')[0];
        // 密码
        $.pwd = totalList[i].split(',')[1].split(':')[1];
        console.log(`\n*****开始第【${$.index}】个网站****\n`);
        await main();
        await $.wait(2000)
    }
    if (message) {
        await notify.sendNotify(`${$.name}`, `${message}`);
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

async function main() {
    await login();
}

/**
 * 登录
 *
 * @returns {*}
 */
async function login() {
    return new Promise(async (resolve) => {
        $.post(sendPost('auth/login', `email=${$.email}&passwd=${$.pwd}&code=`), async (err, response, data) => {
            try {
                if (err) {
                    console.log(`login API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    console.log(data.msg, '\n');
                    // 开始签到
                    await $.wait(2000)
                    await checkin();
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 签到
 *
 * @returns {*}
 */
function checkin() {
    return new Promise((resolve) => {
        $.post(sendPost('user/checkin', ''), (err, response, data) => {
            try {
                if (err) {
                    console.log(`checkin API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    console.log('开始进行签到...\n');
                    data = JSON.parse(data);
                    message += `开始第【${$.index}】个网站\n`;
                    if (data.ret === 1) {
                        if (data.trafficInfo) {
                            console.log(`${data.msg}\n今日已用：${data.trafficInfo.todayUsedTraffic}\n过去已用：${data.trafficInfo.lastUsedTraffic}\n剩余流量：${data.trafficInfo.unUsedTraffic}\n\n`);
                            message += `${data.msg}\n今日已用：${data.trafficInfo.todayUsedTraffic}\n过去已用：${data.trafficInfo.lastUsedTraffic}\n剩余流量：${data.trafficInfo.unUsedTraffic}\n\n`;
                        } else {
                            console.log(`${data.msg}\n`)
                            message += `${data.msg}\n\n`;
                        }
                    } else {
                        console.log(data.msg, '\n');
                        message += data.msg + '\n\n';
                    }
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        })
    })
}

function sendPost(path, body = {}) {
    return {
        url: `${$.SITE_URL}/${path}`,
        body: body,
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer": `${$.SITE_URL}/${path}`,
            "Accept-encoding": "gzip, deflate, br",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        }
    }
}
