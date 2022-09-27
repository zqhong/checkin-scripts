/**
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2022/01/20 09:23
 * @description 葫芦侠自动签到（应网友要求）
 */
const $ = new Env('葫芦侠自动签到');
const notify = $.isNode() ? require('../sendNotify') : '';
let total = process.env.HLX_ACCOUNTS, totalList = [], message = '';
const HLX_API = 'http://floor.huluxia.com';
const headers = {
    // "Connection": "close",
    // "Content-Type": "application/x-www-form-urlencoded",
    // "Host": "floor.huluxia.com",
    // "Accept-Encoding": "gzip",
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
        $.phone = totalList[i].split('#')[0];
        // MD5 加密密码
        $.paswd = totalList[i].split('#')[1];
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
    // await checkToken();
    // await $.wait(1000);
    await getAllCategory();
}

/**
 * 登录
 *
 * @returns {*}
 */
function login() {
    let param = 'account/login/ANDROID/4.0?device_code=1';
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
                    console.log('data = \n', data);

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
            } catch (err) {
                $.logErr(err, response);
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
    let param = `user/status/ANDROID/2.1?platform=2&gkey=000000&app_version=4.0.0.6.3&versioncode=20141434&market_id=floor_baidu&_key=${$.key}&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00`;
    return new Promise((resolve) => {
        $.get(sendGet(param), (err, response, data) => {
            try {
                if (err) {
                    console.log(`checkToken API 请求失败\n${JSON.stringify(err)}`)
                } else {

                    console.log('key = ', $.key);

                    console.log('data = \n',data.status);

                    // console.log(JSON.parse(data).status === 1 ? "令牌验证成功\n" : "令牌验证失败\n")
                }
            } catch (err) {
                $.logErr(err, response);
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
    let param = `category/list/ANDROID/2.0?platform=2&gkey=000000&app_version=4.0.0.6.3&versioncode=20141434&market_id=floor_baidu&_key=${$.key}&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00&is_hidden=1`
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
                            await $.wait(888);
                        }
                    }
                }
            } catch (err) {
                $.logErr(err, response);
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
    let param = `user/signin/ANDROID/4.0?platform=2&gkey=000000&app_version=4.0.0.6.3&versioncode=20141434&market_id=floor_baidu&_key=${$.key}&device_code=%5Bw%5D02%3A00%3A00%3A00%3A00%3A00&cat_id=${cat_id}`
    return new Promise((resolve) => {
        $.get(sendGet(param), async (err, response, data) => {
            try {
                if (err) {
                    console.log(`signIn API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    await signInResp();
                }
            } catch (err) {
                $.logErr(err, response);
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
            } catch (err) {
                $.logErr(err, response);
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

function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;$.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o))),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
