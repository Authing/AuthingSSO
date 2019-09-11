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

需要先注册一个 [Authing](https://authing.cn/login) 账号，并[创建一个 OIDC 应用](https://docs.authing.cn/authing/advanced/oidc/create-oidc)。

### 发起登录

```js
import AuthingSSO from "@authing/sso";

let auth = new AuthingSSO({
  appId: "SSO_APP_ID",
  appType: "oauth/oidc/saml",
  appDomain: "SSO_APP_DOMAIN",
  nonce: Math.random(),
  timestamp: Date.now()
});

// 发起单点登录，会跳转到登录页面，采用授权码模式，需要相关应用开启授权码模式
auth.login();
```

### 查询登录状态

```js
let res = await auth.trackSession();
/**
 * {
 *    session: { appId: 'xxx', type: 'oidc/oauth/saml', userId: 'yyy'}
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
| appType | 是 | SSO 应用的 类型，可选值为 `oidc`，`oauth`，`saml` | - |
| appDomain | 是 | SSO 应用域名，例如 `app1.authing.cn` | - |
| nonce | 否 | 随机数 | 随机数 |
| timestamp | 否 | 时间戳 | 当前时间戳 |

示例

```js
let auth = new AuthingSSO({
  appId: "SSO_APP_ID",
  appType: "oidc",
  appDomain: "SSO_APP_DOMAIN",
  nonce: Math.random(),
  timestamp: Date.now()
});
```

### AuthingSSO.prototype.login

示例

```js
auth.login();
```

### AuthingSSO.prototype.trackSession

示例

```js
let res = await auth.trackSession();
/**
 * {
 *    session: { appId: 'xxx', type: 'oidc/oauth/saml', userId: 'yyy'}
 * }
 * */
```

### AuthingSSO.prototype.logout

示例

```js
let res = await auth.logout();
/**
 * {
 *    message: "单点登出成功",
 *    code: 200
 * }
 * */
```

## Get Help

1. Join us on Gitter: [#authing-chat](https://gitter.im/authing-chat/community)
