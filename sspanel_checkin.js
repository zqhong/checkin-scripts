/**
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2021/9/25 22:11
 * @last Modified by sudojia
 * @last Modified time 2021/9/27 15:22
 * @description SSPANEL面板自动签到
 */
const $ = new require('./env').Env('SSPANEL面板自动签到');
const notify = $.isNode() ? require('./sendNotify') : '';
let total = $.isNode() ? (process.env.SITE_ACCOUNTS ? process.env.SITE_ACCOUNTS : '') : ($.getdata('SITE_ACCOUNTS') ? $.getdata('SITE_ACCOUNTS') : ''),
    totalList = [], message = '';

// 如果大于 -1 说明是多账号，存入到数组中，否则就是单账号！
if (total.indexOf('&') > -1) {
    totalList = total.split('&');
} else {
    totalList = [total];
}

!(async () => {
    if (!total) {
        console.log('请设置环境变量')
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
    return new Promise((resolve) => {
        $.post(sendPost('user/checkin', ''), (err, response, data) => {
            try {
                if (err) {
                    console.log(`签到 API 请求失败，请把下方报错日志发给 Telegram@sudojia\n${JSON.stringify(err)}`)
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
                    console.log(`登录 API 请求失败，请把下方报错日志发给 Telegram@sudojia\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    console.log(data.msg, '\n');
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
            "Accept": " application/json, text/javascript, */*; q=0.01",
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-requested-with": "XMLHttpRequest",
            "Origin": `${$.SITE_URL}`,
            "Referer": `${$.SITE_URL}`,
            "Accept-encoding": "gzip, deflate, br",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        }
    }
}
