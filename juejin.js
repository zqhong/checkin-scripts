/**
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2022/01/19 21:26
 * @description 掘金自动签到
 */
const $ = new require('./env').Env('掘金自动签到');
const notify = $.isNode() ? require('./sendNotify') : '';
let JUEJIN_COOKIE = process.env.JUEJIN_COOKIE, cookie = '', cookiesArr = [], message = '';
const JUEJIN_API = 'https://api.juejin.cn';

if (JUEJIN_COOKIE.indexOf('&') > -1) {
    cookiesArr = JUEJIN_COOKIE.split('&');
} else {
    cookiesArr = [JUEJIN_COOKIE];
}

!(async () => {
    if (!JUEJIN_COOKIE) {
        console.log('请设置环境变量【JUEJIN_COOKIE】')
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.index = i + 1;
            $.isLogin = true;
            await checkCookie();
            console.log(`\n*****开始第【${$.index}】个账号****\n`);
            if (!$.isLogin) {
                await notify.sendNotify(`「掘金签到报告」`, `掘金账号${$.index} Cookie已失效，请重新登录获取Cookie`);
            }
            await main();
            await $.wait(2000);
        }
    }
    if (message) {
        await notify.sendNotify(`「掘金签到报告」`, `${message}`);
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

async function main() {
    await getUserName();
    await $.wait(888)
    await queryFreeLuckyDrawCount();
    await $.wait(888)
    await checkStatus();
}

/**
 * 检测签到状态
 */
function checkStatus() {
    return new Promise((resolve) => {
        $.get(sendGet('growth_api/v1/get_today_status', ''), async (err, response, data) => {
            try {
                if (err) {
                    console.log(`checkStatus API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (0 === data.err_no) {
                        if (data.data) {
                            // 如果为 true, 则今日已完成签到
                            console.log('您今日已完成签到，请勿重复签到~')
                        } else {
                            // false 表示今日未签到
                            // 调用签到函数
                            await checkIn()
                        }
                    } else {
                        $.isLogin = false;
                        console.log('Cookie 可能失效了，请重新获取!!!');
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
 * 签到函数
 *
 * @returns {*}
 */
function checkIn() {
    return new Promise((resolve) => {
        $.post(sendPost('growth_api/v1/check_in', ``), async (err, response, data) => {
            try {
                if (err) {
                    console.log(`checkIn API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (0 === data.err_no) {
                        // 签到所获取的矿石数
                        $.incrPoint = data.data.incr_point;
                        // 当前账号总矿石数
                        $.sumPoint = data.data.sum_point;
                        message += `「掘金签到报告」\n\n📣=============账号${$.index}=============📣\n【账号昵称】${$.userName}\n【签到状态】已签到\n【今日收入】${$.incrPoint}矿石数\n【总矿石数】${$.sumPoint}矿石数`
                        await getCount();
                        if (0 === $.freeCount || -1 === $.freeCount) {
                            console.log('今日免费抽奖次数已用尽!')
                        } else {
                            for (let i = 0; i < $.freeCount; i++) {
                                // 调用抽奖函数
                                await luckyDraw();
                                await $.wait(1500);
                            }
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
 * 统计签到天数, 没什么用~
 */
function getCount() {
    return new Promise((resolve) => {
        $.get(sendGet('growth_api/v1/get_counts', ``), (err, response, data) => {
            try {
                if (err) {
                    console.log(`getCount API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (0 === data.err_no) {
                        message += `\n【签到统计】连签${data.data.cont_count}天、累签${data.data.sum_count}天`
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
 * 查询免费抽奖次数
 */
function queryFreeLuckyDrawCount() {
    return new Promise((resolve) => {
        $.get(sendGet('growth_api/v1/lottery_config/get', ``), (err, response, data) => {
            try {
                if (err) {
                    console.log(`queryFreeLuckyDrawCount API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (0 === data.err_no) {
                        // 获取到免费抽奖次数
                        $.freeCount = data.data.free_count;
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
 * 抽奖函数
 * 目前已知奖品
 * lottery_id: 6981716980386496552、name: 66矿石、type: 1
 * lottery_id: 6981716405976743943、name: Bug、type: 2
 * lottery_id: 7020245697131708419、name: 掘金帆布袋、type: 4
 * lottery_id: 7017679355841085472、name: 随机限量徽章、type: 4
 * lottery_id: 6997270183769276416、name: Yoyo抱枕、type: 4
 * lottery_id: 7001028932350771203、name: 掘金马克杯、type: 4
 * lottery_id: 7020306802570952718、name: 掘金棒球帽、type: 4
 * lottery_id: 6981705951946489886、name: Switch、type: 3
 */
function luckyDraw() {
    return new Promise((resolve) => {
        $.post(sendPost('growth_api/v1/lottery/draw', ``), (err, response, data) => {
            try {
                if (err) {
                    console.log(`luckyDraw API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (0 === data.err_no) {
                        message += `\n【抽奖信息】抽中了${data.data.lottery_name}`;
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
 * 获取昵称
 */
function getUserName() {
    return new Promise((resolve) => {
        $.get(sendGet('user_api/v1/user/get', ``), (err, response, data) => {
            try {
                if (err) {
                    console.log(`getUserName API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    if (0 === data.err_no) {
                        $.userName = data.data.user_name;
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
 * 检测 Cookie 是否失效、没法子了，只能另写个方法了！
 */
function checkCookie() {
    return new Promise((resolve) => {
        $.get(sendGet('growth_api/v1/get_today_status', ''), (err, response, data) => {
            try {
                if (err) {
                    console.log(`checkCookie API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    console.log(data);
                    if (403 === data.err_no) {
                        $.isLogin = false;
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

function sendGet(path, body) {
    return {
        url: `${JUEJIN_API}/${path}?body=${body}`,
        headers: {
            "Accept": "*/*",
            "Content-type": "application/json",
            "Referer": `${JUEJIN_API}`,
            "Cookie": `${cookie}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        }
    }
}

function sendPost(path, body = {}) {
    return {
        url: `${JUEJIN_API}/${path}`,
        body: body,
        headers: {
            "Accept": "*/*",
            "Content-type": "application/json",
            "Referer": `${JUEJIN_API}`,
            "Cookie": `${cookie}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
        }
    }
}
