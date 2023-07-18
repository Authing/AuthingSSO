# authing-sso-demo

使用 Authing 实现 SSO。

## 运行此程序

- 修改 src/views/index.html 中的初始化配置

```js
const auth = new AuthingSSO.AuthingSSO({
  appId: 'AUTHING_APP_ID',
  // SSO 应用面板地址
  origin: 'https://{SSO 应用面板地址}.authing.cn',
  // 应用登录回调 URL
  redirectUri: 'http://localhost:3001/login/callback'
})
```

- 安装依赖
``` shell
npm ci
```

- 运行 demo
``` shell
npm run start
```

浏览器打开 localhost:3001 即可

## 开发教程

开发教程请参考：[使用 Authing 实现单点登录](https://docs.authing.cn/v2/reference/sdk-for-sso.html)。
