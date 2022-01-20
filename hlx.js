/**
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2022/01/20 09:23
 * @description 葫芦侠自动签到（应网友要求）
 */
const $ = new require('./env').Env('葫芦侠自动签到');
const notify = $.isNode() ? require('./sendNotify') : '';
let total = process.env.HLX_ACCOUNTS, totalList = [], message = '';
const HLX_API = 'http://floor.huluxia.com';
const headers = {
    "Connection": "close",
    "Content-Type": "application/x-www-form-urlencoded",
    "Host": "floor.huluxia.com",
    "Accept-Encoding": "gzip",
    "User-Agent": "okhttp/3.8.1"
};

if (total.indexOf('&') > -1) {
    totalList = total.split('&');
} else {
    totalList = [total];
}

!(async () => {
    if (!total) {
        console.log('请设置环境变量【HLX_ACCOUNTS】')
        return;
    }
    for (let i = 0; i < totalList.length; i++) {
        $.index = i + 1;
        // 账号
        $.phone = totalList[i].split('@')[0];
        // MD5 加密密码
        $.paswd = totalList[i].split('@')[1];
        console.log(`\n*****开始第【${$.index}】个账号****\n`);
        await main();
        await $.wait(2000)
    }
    if (message) {
        await notify.sendNotify(`「葫芦侠签到报告」`, `${message}`);
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

async function main() {
    await login();
    await $.wait(1000);
    await checkToken();
    await $.wait(1000);
    await getAllCategory();
}

/**
 * 登录
 *
 * @returns {*}
 */
function login() {
    let param = 'account/login/ANDROID/4.0?platform=2&gkey=000000&app_version=4.0.0.6.2&versioncode=20141433&market_id=floor_baidu&_key=&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00';
    let sudojia = {
        url: `${HLX_API}/${param}`,
        body: `account=${$.phone}&login_type=2&password=${$.paswd}`,
        headers: headers
    }
    return new Promise((resolve) => {
        $.post(sudojia, (err, response, data) => {
            try {
                if (err) {
                    console.log(`login API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (data._key) {
                        console.log(`登录成功~\n`)
                        // 等级
                        $.level = data.user.level;
                        // 令牌
                        $.key = data._key;
                        // 昵称
                        $.nick = data.user.nick;
                        message += `📣=============账号${$.index}=============📣\n【社区昵称】${$.nick}\n【社区等级】${$.level}\n`
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

/**
 * 令牌验证
 *
 * @returns {*}
 */
function checkToken() {
    let param = `user/status/ANDROID/2.1?platform=2&gkey=000000&app_version=4.0.0.6.2&versioncode=20141433&market_id=floor_baidu&_key=${$.key}&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00`;
    return new Promise((resolve) => {
        $.get(sendGet(param), (err, response, data) => {
            try {
                if (err) {
                    console.log(`checkToken API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    console.log(JSON.parse(data).status === 1 ? "令牌验证成功\n" : "令牌验证失败\n")
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
 * 获取所有社区板块
 *
 * @returns {*}
 */
function getAllCategory() {
    let param = `category/list/ANDROID/2.0?platform=2&gkey=000000&app_version=4.0.0.6.2&versioncode=20141433&market_id=floor_baidu&_key=${$.key}&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00&is_hidden=1`
    return new Promise((resolve) => {
        $.get(sendGet(param), async (err, response, data) => {
            try {
                if (err) {
                    console.log(`getAllCategory API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    let categoryList = data.categories;
                    message += '===========签到详细===========\n';
                    // 排除 ID 为 0 和 94 的版块
                    for (let c of categoryList) {
                        if (c.categoryID !== 0 && c.categoryID !== 94) {
                            $.title = c.title
                            await signIn(c.categoryID)
                            await $.wait(1500);
                        }
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

/**
 * 签到
 *
 * @param cat_id 社区 ID
 * @returns {*}
 */
function signIn(cat_id) {
    let param = `user/signin/ANDROID/4.0?platform=2&gkey=000000&app_version=4.0.0.6.2&versioncode=20141433&market_id=floor_baidu&_key=${$.key}&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00&cat_id=${cat_id}`
    return new Promise((resolve) => {
        $.get(sendGet(param), async (err, response, data) => {
            try {
                if (err) {
                    console.log(`signIn API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    await signInResp();
                }
            } catch (e) {
                $.logErr(e, response);
            } finally {
                resolve();
            }
        })
    })
}

function signInResp() {
    let param = `user/signin/detail/ANDROID/4.0?platform=2&gkey=000000&app_version=4.0.0.6.2&versioncode=20141433&market_id=floor_baidu&_key=${$.key}&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00`
    return new Promise((resolve) => {
        $.get(sendGet(param), (err, response, data) => {
            try {
                if (err) {
                    console.log(`signInResp 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (data.experienceVal) {
                        console.log(`【${$.title}】签到成功~`)
                        message += `【${$.title}】签到成功~获得${data.experienceVal}经验，已连续签到${data.continueDays}天\n`
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

function sendGet(param) {
    return {
        url: `${HLX_API}/${param}`,
        headers: headers
    }
}
