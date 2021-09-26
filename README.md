SSPANEL 面板自动签到

目前使用 GitHub Actions 来完成签到操作

本想用 JAVA 的，但是这么一个小小的东西，决定还是用 JavaScript

程序每天早上北京时间七点三十五运行，Actions 会有延迟的，几分钟甚至半小时

## *Env*

|   Name   |                            Value                             |
| :------: | :----------------------------------------------------------: |
| ACCOUNTS | 账号+密码<br>账号密码之间用`英文逗号`分割<br>多个账号用 & 分割<br>e.g：A ✈场网站和 B ✈场网站，则变量填：`aaa@gmail.com,123456&bbb@gmail.com,123123` |
| SITE_URL | ✈场的网站，必须是 SSPANEL 面板噢<br>多个请用 & 分割<br>e.g：`https://aaa.com&https://bbb.com` |

## 消息推送 Env

|       Name        |                            Value                             |  属性  |
| :---------------: | :----------------------------------------------------------: | :----: |
|    `PUSH_KEY`     | 微信 server 酱推送，[官方文档](http://sc.ftqq.com/3.version)，已兼容 [Server酱·Turbo 版](https://sct.ftqq.com/) | 非必须 |
|  `TG_BOT_TOKEN`   | Telegram 推送，填写自己申请 [@BotFather](https://t.me/BotFather) 的 Token | 非必须 |
|   `TG_USER_ID`    | 找它 [@getuseridbot](https://t.me/getuseridbot) 获取自己的 ID<br>如果你填了 `TG_BOT_TOKEN`，那么 `TG_USER_ID` 也要必填 | 非必须 |
|  `DD_BOT_TOKEN`   | 钉钉推送 [官方文档](https://developers.dingtalk.com/document/app/custom-robot-access)<br>只需 `https://oapi.dingtalk.com/robot/send?access_token=XXX` 等于`=`符号后面的XXX即可 | 非必须 |
|  `DD_BOT_SECRET`  | 钉钉推送，密钥，机器人安全设置页面，加签一栏下面显示的 SEC 开头的 `SECXXXXXXXXXX` 等字符 , 注：钉钉机器人安全设置只需勾选`加签`即可，其他选项不要勾选！<br>如果你填了 `DD_BOT_TOKEN` 那么 `DD_BOT_SECRET` 必填！ | 非必须 |
| `PUSH_PLUS_TOKEN` | pushplus 推送，微信扫码登录后一对一推送或一对多推送下面的 token(您的Token) [官方网站](http://www.pushplus.plus/) | 非必须 |
| `PUSH_PLUS_USER`  | pushplus 推送，一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码）<br>注:(1、需订阅者扫描二维码 2、如果您是创建群组所属人，也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送)<br>只填 `PUSH_PLUS_TOKEN` 默认为一对一推送 | 非必须 |

## 注意事项

变量里填写的✈场网站要和变量里填写的账号的顺序以及个数要保持一致，另外， `SITE_URL`  环境变量里，假如你填写了 A 站和 B 站，那么  `ACCOUNTS`  变量第一个就是 A 站的账号密码，第二个就是 B 站的账号密码！一 一对应。

**一个✈场下我有多个账号怎么操作？**

在  `SITE_URL`  变量再  `&`  同一个的网站不就好了嘛

e.g：A&A&B

## TODO

- [x] 多账号
- [x] 多网站
- [x] 消息推送

## 历程

- 2021-9-26 9:51：添加消息推送

- 2021-9-26 0:04：支持多账号、多网站！
- 2021-9-25 22:39：第一个版本推出，仅支持单网站、单账号签到

## 机场推荐