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
    if (typeof event?.data?.code === 'number' && event?.data?.data?.token) {
      window.postMessage(event.data, '*');
    }
  },
  false,
);
```
