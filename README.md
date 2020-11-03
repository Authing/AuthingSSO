# AuthingSSO

Authing SSO SDK 用于发起 SSO 登录、查询 SSO 登录状态、单点登出。

## 安装

### 通过 NPM 安装

```shell
$ npm install @authing/sso --save
```

接着可以通过以下方式使用

```js
import AuthingSSO from "@authing/sso";
```

### 通过 CDN 安装

```html
<script src="https://cdn.jsdelivr.net/npm/@authing/sso/dist/AuthingSSO.umd.min.js"></script>

<script>
  console.log(AuthingSSO);
</script>
```

## 开始使用

需要先注册一个 [Authing](https://console.authing.cn) 账号，并[创建一个 OIDC 应用](https://docs.authing.cn/authentication/oidc/create-oidc.html)。

### 发起登录

#### 跳转登录

```js
import AuthingSSO from "@authing/sso";

let auth = new AuthingSSO({
  appId: "SSO_APP_ID",
  appType: "可填：oauth/oidc/saml", // 默认 oidc
  appDomain: "SSO_APP_DOMAIN"
});

// 发起单点登录，会跳转到登录页面，采用授权码模式，需要相关应用开启授权码模式
auth.login();
```

#### 窗口登录

```js
import AuthingSSO from "@authing/sso";

let auth = new AuthingSSO({
  appId: "SSO_APP_ID",
  appType: "可填：oauth/oidc/saml", // 默认 oidc
  appDomain: "SSO_APP_DOMAIN"
});

// 发起单点登录，会弹出一个窗口，里面是登录页面，采用授权码模式，需要相关应用开启授权码模式
auth.windowLogin();
```

业务域名回调地址需要托管一个 html 文件，用于将得到的 code access_token id_token 等参数，通过 postMessage 的方式发送给父窗口，然后将本窗口关闭。

例如，回调地址填写的是 https://example.com/handle.html 这个 html 内部需要编写一段发送 postMessage 的代码，负责从 url 中取出相关参数并传递给父窗口。

Github 参考代码：[https://github.com/Authing/oidc-window](https://github.com/Authing/oidc-window)

### 查询登录状态

```js
let res = await auth.trackSession();
/**
 * {
 *    session: { appId: 'xxx', type: 'oidc/oauth/saml', userId: 'yyy'},
 *    userInfo: {
 *      "_id": "USER_ID",
 *      "email": "USER_EMAIL",
 *      "registerInClient": "CLIENT_ID",
 *      "token": "JTW_TOKEN",
 *      "tokenExpiredAt": "2019-10-28 10:15:32",
 *      "photo": "PICTURE",
 *      "company": "",
 *      "nickname": "NICKNAME",
 *      "username": "USERNAME",
 *   },
 *   urlParams: {
 *      code: 'xxx', // 这些参数是从 url 中获取到的，需要开发者自己存储以备使用
 *      id_token: 'ID_TOKEN',
 *      access_token: 'ACCESS_TOKEN'
 *   }
 * }
 *
 * 如果 session 不存在，返回：
 *
 * {
 *   session: null
 * }
 * */
```

### 登出

```js
let res = await auth.logout();
/**
 * {
 *    message: "单点登出成功",
 *    code: 200
 * }
 * */
```

## API

### AuthingSSO.prototype.constructor

构造函数，接受一个对象作为参数。对象中的参数列表如下：

| 参数名 | 是否必填 | 描述 | 默认 |
| ----- | ------- | ---- | -- |
| appId | 是 | SSO 应用的 ID | - |
| appDomain | 是 | SSO 应用域名，不带 `https://`，形如 `xxx.authing.cn`，`xxx` 为你填在应用详情中的认证地址字段内的内容 | - |
| appType | 否 | SSO 应用的 类型，可选值为 `oidc`，`oauth`，`saml` | `oidc` |
| responseType | 否 | SSO 应用授权流程，可选值为 `code`，`implicit` | `code` |
| redirectUrl | 否 | SSO 应用回调域名 | 在 Authing 控制台配置的第一个业务域名 |
| nonce | 否 | 随机数 | 随机数 |
| timestamp | 否 | 时间戳 | 当前时间戳 |

示例：

```js
let auth = new AuthingSSO({
  appId: "SSO_APP_ID",
  appType: "oidc",
  appDomain: "SSO_APP_DOMAIN"
});
```

### AuthingSSO.prototype.login

请求应用的授权地址，进行登录。

示例：

```js
auth.login();
```

### AuthingSSO.prototype.trackSession

查询单点登录状态，已登录时会返回会话信息和用户信息。

示例：

```js
let res = await auth.trackSession();
/**
 * {
 *    session: { appId: 'xxx', type: 'oidc/oauth/saml', userId: 'yyy'},
 *    userInfo: {
 *      "_id": "USER_ID",
 *      "email": "USER_EMAIL",
 *      "registerInClient": "CLIENT_ID",
 *      "token": "JTW_TOKEN",
 *      "tokenExpiredAt": "2019-10-28 10:15:32",
 *      "photo": "PICTURE",
 *      "company": "",
 *      "nickname": "NICKNAME",
 *      "username": "USERNAME",
 *   },
 *   urlParams: {
 *      code: 'xxx', // 这些参数是从 url 中获取到的，需要开发者自己存储以备使用
 *      id_token: 'ID_TOKEN',
 *      access_token: 'ACCESS_TOKEN'
 *   }
 * }
 *
 * 如果 session 不存在，返回：
 *
 * {
 *   session: null
 * }
 * */
```

### AuthingSSO.prototype.logout

从应用单点登出。

示例：

```js
let res = await auth.logout();
/**
 * {
 *    message: "单点登出成功",
 *    code: 200
 * }
 * */
```

### AuthingSSO.prototype.getUrlHash

获取 Url 中的 Hash 部分内容，返回一个 JSON 对象。

示例：

```js
let obj = auth.getUrlHash()
/**
 * {
 *    id_token: 'xxx',
 *    access_token: 'xxx'
 * }
 * */
```

## Get Help

1. Join us on Gitter: [#authing-chat](https://gitter.im/authing-chat/community)
