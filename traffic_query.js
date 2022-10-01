/**
 * 本人自用脚本, 其他人无视即可！
 */
const $ = new require('./env').Env('流量查询');
const notify = $.isNode() ? require('./sendNotify') : '';
let car_no = process.env.CAR_NO, host = process.env.HOST, body = process.env.BODY, carNoList = [], message = '';

if (car_no.indexOf('&') > -1) {
    carNoList = car_no.split('&');
} else {
    carNoList = [car_no];
}

!(async () => {
    if (!car_no) {
        console.log('请先设置环境变量【CAR_NO】')
        return;
    }
    for (let i = 0; i < carNoList.length; i++) {
        $.index = i + 1;
        $.eti = "";
        console.log(`\n*****开始第【${$.index}】账号****\n`);
        message += `📣======第【${$.index}】个账号查询======📣\n`;
        await main();
        await $.wait(1000)
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
    await $.wait(1000)
    await doQuery();
}

function login() {
    return new Promise((resolve) => {
        $.get(sendGet(`mini/user/login?${body}`), (err, response, data) => {
            try {
                if (err) {
                    console.log(`login 接口请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    console.log(200 === data.code ? "登录成功" : "状态异常");
                    $.eti = data.data.eti
                }
            } catch (err) {
                $.logErr(err, response);
            } finally {
                resolve();
            }
        })
    })
}

function doQuery() {
    return new Promise((resolve) => {
        $.post(sendPost(`mini/card/details`, `cardNo=${car_no}`), (err, response, data) => {
            try {
                if (err) {
                    console.log(`query 接口请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    // 总共使用量
                    let usedFlow = data.data.details.usedFlow;
                    // 剩余流量
                    let leftFlow = data.data.details.leftFlow;
                    // 总流量
                    let totalFlow = data.data.details.totalFlow;
                    console.log(data.msg);
                    message += `查询时间：${data.time}\n总流量：${totalFlow}MB\n剩余流量：${leftFlow}MB\n总使用：${usedFlow}MB\n`;
                }
            } catch (err) {
                $.logErr(err, response);
            } finally {
                resolve();
            }
        })
    })
}

function sendGet(path) {
    return {
        url: `${host}/${path}`,
        headers: {
            "Connection": "keep-alive",
            "charset": "utf-8",
            "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3263 MMWEBSDK/20220402 Mobile Safari/537.36 MMWEBID/6026 MicroMessenger/8.0.22.2140(0x28001637) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
            "Content-type": "application/json; charset=utf-8",
            "Accept-Encoding": "gzip,compress,br,deflate",
        }
    }
}

function sendPost(path, body = {}) {
    return {
        url: `${host}/${path}?`,
        body: body,
        headers: {
            "Connection": "keep-alive",
            "charset": "utf-8",
            "User-Agent": "Mozilla/5.0 (Linux; Android 9; ONEPLUS A5000 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3263 MMWEBSDK/20220402 Mobile Safari/537.36 MMWEBID/6026 MicroMessenger/8.0.22.2140(0x28001637) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
            "Content-type": "application/json; charset=utf-8",
            "Accept-Encoding": "gzip,compress,br,deflate",
        }
    }
}


