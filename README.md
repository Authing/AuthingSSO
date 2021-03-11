# AuthingSSO

Authing SSO SDK 用于发起 SSO 登录、查询 SSO 登录状态、单点登出。

## 单点登录（SSO）

**单点登录**（Single Sign On），简称为 **SSO**，是目前比较流行的企业业务整合的解决方案之一。 SSO 的定义是在多个应用系统中，**用户只需要登录一次**就可以**访问所有**相互信任的应用系统。你可以阅读[此篇指引](https://docs.authing.cn/v2/guides/authentication/sso/)了解如何快速在你的应用中实现单点登录。

## 安装 <a id="install"></a>

### 通过 NPM 安装 <a id="npm-install"></a>

```bash
$ npm install @authing/sso --save
```

接着可以通过以下方式使用

```js
import AuthingSSO from "@authing/sso";
```

### 通过 CDN 安装 <a id="cdn-install"></a>

```html
<script src="https://cdn.jsdelivr.net/npm/@authing/sso/dist/AuthingSSO.umd.min.js"></script>
<script>
  console.log(AuthingSSO);
</script>
```

## 快速开始 <a id="getting-started"></a>

在开始之前，你需要先[创建一个应用](https://docs.authing.cn/v2/guides/app/create-app.html)。

### 初始化

初始化 AuthingSSO SDK 需要传入[应用 ID](https://docs.authing.cn/v2/guides/faqs/get-app-id-and-secret.html) 和应用域名，应用域名格式为 `example-app.authing.cn`，**不带协议头和 Path** 。详细参数请见[初始化构造函数](#初始化构造函数)。

```js
import AuthingSSO from "@authing/sso";

let auth = new AuthingSSO({
  appId: "APP_ID",
  appDomain: "example-app.authing.cn",
});
```

::: hint-info
**私有化部署**场景需要指定你私有化的 Authing 服务的 GraphQL 端点，如果你不清楚可以联系 Authing IDaaS 服务管理员。

```js
let auth = new AuthingSSO({
  appId: "APP_ID",
  appDomain: "example-app.you-authing-service.cn",
  host: {
    oauth: "https://core.you-authing-service.com/graphql",
  },
});
```

### 发起登录

#### 跳转登录

发起单点登录，会跳转到登录页面，采用[授权码模式](https://docs.authing.cn/v2/guides/federation/oidc.html)，需要相关应用开启授权码模式。

```js
auth.login();
```

#### 窗口登录

发起单点登录，会弹出一个窗口，里面是登录页面，采用授权码模式，需要相关应用开启授权码模式

```js
auth.windowLogin();
```

业务域名回调地址需要托管一个 html 文件，用于将得到的 `code` `access_token` `id_token` 等参数，通过 `postMessage` 的方式发送给父窗口，然后将本窗口关闭。

例如，回调地址填写的是 [https://example.com/handle.html](https://example.com/handle.html)，这个 html 内部需要编写一段发送 `postMessage` 的代码，负责从 `url` 中取出相关参数并传递给父窗口。

Github 参考代码：[https://github.com/Authing/oidc-window](https://github.com/Authing/oidc-window)。

### 跳转注册页

有时你可能希望让用户跳转到注册页面，使用示例如下：

```js
// 调用此函数可以直接跳转到注册页面
auth.register();
```

### 查询登录状态 <a id="check-login-status"></a>

当用户登录完成跳转回你的业务地址后，你可以使用此方法查询到该用户在此应用的登录状态。如果用户处于登录状态，可以获取到该用户的用户信息，你可以在此了解[用户信息的所有字段释义](https://docs.authing.cn/v2/guides/user/user-profile.html)。

::: hint-danger
从 13.1 版本开始，Safari 默认会**阻止第三方 Cookie**，会影响 Authing 的某些**单点登录功能**。其他类似的更新，从 Chrome 83 版本开始，**隐身模式**下默认禁用第三方 Cookie。其他浏览器也在慢慢进行此类更新以保护用户隐私，很多浏览器将禁用第三方 Cookie 作为了一个安全配置功能。

这可能会对此方法产生影响，详情请见 [禁用第三方 Cookie 对 Authing 的影响](https://docs.authing.cn/v2/guides/faqs/block-third-party-cookie-impact.html#tracksession)，你可以在此[查看解决方案](https://docs.authing.cn/v2/guides/faqs/block-third-party-cookie-impact.html)。

```js
let res = await auth.trackSession();
/**
 * {
 *    session: { appId: 'xxx', type: 'oidc/oauth', userId: 'yyy'},
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

获取到用户信息之后，你可以得到用户的身份凭证（用户信息的 `token` 字段），你可以在客户端后续发送给后端服务器的请求中携带上此 `token`, 以 `axios` 为例：

```js
const axios = require("axios");
axios
  .get({
    url: "https://yourdomain.com/api/v1/your/resources",
    headers: {
      Authorization: "Bearer YOUR_JWT_TOKN",
    },
  })
  .then((res) => {
    // custom codes
  });
```

在后端接口中需要检验此 `token` 的合法性，来验证用户的身份，验证方式详情请见[验证用户身份凭证（token）](https://docs.authing.cn/v2/guides/faqs/how-to-validate-user-token.html)。识别用户身份之后，你可能还需要[对该用户进行权限管理](https://docs.authing.cn/v2/guides/access-control/)，以判断用户是否对此 API 具备操作权限。

### 退出登录 <a id="logout"></a>

**该方法为异步函数，请确保使用 `await` 等待结果返回再进行下一步操作。**

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

### 初始化构造函数

构造函数，接受一个对象作为参数。对象中的参数列表如下：

<table>
  <thead>
    <tr>
      <th style="text-align:left">参数名</th>
      <th style="text-align:left; width:60px">是否必填</th>
      <th style="text-align:left">描述</th>
      <th style="text-align:left">默认值</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">appId</td>
      <td style="text-align:left">是</td>
      <td style="text-align:left">应用 ID</td>
      <td style="text-align:left">-</td>
    </tr>
    <tr>
      <td style="text-align:left">appDomain</td>
      <td style="text-align:left">是</td>
      <td style="text-align:left">应用域名，例如 <code>app1.authing.cn</code>
      </td>
      <td style="text-align:left">-</td>
    </tr>
    <tr>
      <td style="text-align:left">appType</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">应用类型，可选值为 <code>oidc</code>，<code>oauth</code>。
      </td>
      <td style="text-align:left"><code>oidc</code>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">scope</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">授权域</td>
      <td style="text-align:left">'openid profile email phone',<router-link to="/concepts/oidc-common-questions.html#scope-参数对应的用户信息">查看支持的 scope 列表</router-link>。</a>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">state</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">自定义字符串，回调地址也会受到此参数，内容相同，可用于传递自定义信息。</td>
      <td
      style="text-align:left">随机字符串</td>
    </tr>
    <tr>
      <td style="text-align:left">host</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">一个对象，用于指定 GraphQL 地址。 <b>私有化部署场景需要指定你私有化的 Authing 服务的 GraphQL 端点，如果你不清楚可以联系 Authing IDaaS 服务管理员。</b></td>
      <td style="text-align:left">
        使用 Authing 公有云的 GraphQL 端点
      </td>
    </tr>
    <tr>
      <td style="text-align:left">host.oauth</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">GraphQL &#x901A;&#x4FE1;&#x5730;&#x5740;</td>
      <td style="text-align:left">https://core.authing.cn/graphql</td>
    </tr>
    <tr>
      <td style="text-align:left">responseType</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">应用授权流程，可选值为 <code>code</code>&#xFF0C;<code>implicit</code>
      </td>
      <td style="text-align:left"><code>code</code>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">redirectUrl</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">应用回调地址</td>
      <td style="text-align:left">在 Authing 控制台<router-link to="/guides/app/create-app">创建应用时填写的业务域名</router-link>。</td>
    </tr>
    <tr>
      <td style="text-align:left">nonce</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">随机数</td>
      <td style="text-align:left">随机数	</td>
    </tr>
    <tr>
      <td style="text-align:left">timestamp</td>
      <td style="text-align:left">否</td>
      <td style="text-align:left">时间戳	</td>
      <td style="text-align:left">当前时间戳</td>
    </tr>
  </tbody>
</table>

示例：

```js
let auth = new AuthingSSO({
  appId: "APP_ID",
  appDomain: "example-app.authing.cn",
});
```

### login

请求应用的授权地址，进行登录。

参数列表：

| 参数名 | 是否必填 | 描述                              | 默认                 |
| ------ | -------- | --------------------------------- | -------------------- |
| lang   | 否       | 语言，可选值为 `zh-CN` 和 `en-US` | 由浏览器语言环境决定 |

示例：

```js
auth.login();
```

### register

调用此函数可以直接跳转到注册页面。

参数列表：

| 参数名 | 是否必填 | 描述                              | 默认                 |
| ------ | -------- | --------------------------------- | -------------------- |
| lang   | 否       | 语言，可选值为 `zh-CN` 和 `en-US` | 由浏览器语言环境决定 |

示例：

```js
auth.register();
```

### trackSession

示例：

```js
let res = await auth.trackSession();
/**
 * {
 *    session: { appId: 'xxx', type: 'oidc/oauth', userId: 'yyy'},
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

### logout

**该方法为异步函数，请确保使用 `await` 等待结果返回再进行下一步操作。**

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

## 获取帮助 <a id="get-help"></a>

1. Join us on Gitter: [\#authing-chat](https://gitter.im/authing-chat/community)
