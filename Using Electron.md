# 使用 Electron

在 Electron 环境中，有一些需要注意的与常规 Web 环境不同的用法。

## 开启 Context Isolation

如果你用这样的配置创建窗口：

```js
win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      webSecurity: true,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
    },
    ...
```

那么 Authing 窗口可能无法收到第三方登录通过 `postMessage` 传递过来的凭证。

需要在 `preload.js` 中做一次转发：

```js
// Only passing message that Authing needs to the window https://github.com/Authing/Guard/blob/db9df517c00a5eb51e406377ee4d7bb097054b68/src/views/login/SocialButtonsList.vue#L82-L89
// https://stackoverflow.com/questions/55544936/communication-between-preload-and-client-given-context-isolation-in-electron
window.addEventListener(
  'message',
  event => {
    if (typeof event?.data?.code === 'number' && event?.data?.data?.token && event?.data.from !== 'preload') {
      // This message will be catch by this handler again, so we add a 'from' to indicate that it is re-send by ourself
      // we re-send this, so authing in this window can catch it
      window.postMessage({ ...event.data, from: 'preload' }, '*');
    }
  },
  false,
);
```

### 清空第三方登录状态

使用如下的方法可以清空所有 cookies ，包括第三方登录的弹出窗口所在的源的 cookies，从而重置登录状态，允许用户切换账号。

```js
remote.session.defaultSession.clearStorageData();
```

你可能需要将它放在 `preload.js` 里：

```js
const { contextBridge, remote } = require('electron');

contextBridge.exposeInMainWorld('api', {
  clearStorageData: () => {
    remote.session.defaultSession.clearStorageData();
  },
});
```

并在点击登出按钮时调用它：

```js
...
    this.auth = new AuthingSSO({
      appId: APP_ID,
      appDomain: APP_DOMAIN,
      redirectUrl: 'http://localhost:3000',
    });
...
<SomeLogOutButton
    onClick={async () => {
      const { code, message } = await this.auth.logout();
      window.api.clearStorageData();
  ...
```

### 重定向

第三方登录结束后会发起重定向，在 Electron 应用里可以直接使用 `http://localhost:3000` 作为重定向地址，这样在开发模式可以正常跳转，完成登录。而打包后重定向会跳转到 `chrome-error://chromewebdata/` 页面，我们可以在 preload script 里再次重定向。


```js
// on production build, if we try to redirect to http://localhost:3000 , we will reach chrome-error://chromewebdata/ , but we can easily get back
// this happens when we are redirected by OAuth login
const isDev = require('electron-is-dev');
const path = require('path');

const REACT_PATH = isDev
  ? 'http://localhost:3000'
  : `file://${path.resolve(__dirname, '..', '..', 'build', 'index.html')}`;
const CHROME_ERROR_PATH = 'chrome-error://chromewebdata/';

const CHECK_LOADED_INTERVAL = 500;
function refresh() {
  if (window.location.href === CHROME_ERROR_PATH) {
    window.location.replace(REACT_PATH);
  } else {
    setTimeout(refresh, CHECK_LOADED_INTERVAL);
  }
}
setTimeout(refresh, CHECK_LOADED_INTERVAL);
```
