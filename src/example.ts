import { AuthingSSO } from './index'

const auth = new AuthingSSO({
  appId: 'AUTHING_APP_ID',

  // SSO 应用面板地址
  origin: 'https://{SSO 应用面板地址}.authing.cn',

  // 应用登录回调 URL
  redirectUri: 'http://localhost:3001/login/callback'
})

window.onload = async function () {
  let res = await auth.trackSession()
  if (res.session !== null) {
    document.getElementById('h1-user-info').style.display = 'block'
    document.getElementById('user-info').innerHTML = JSON.stringify(res.userInfo, null, 4)
    document.getElementById('btn-logout').style.display = 'inline'
  } else {
    document.getElementById('h1-login').style.display = 'block'
    document.getElementById('btn-login').style.display = 'inline'
  }
}

document.getElementById('btn-login').addEventListener('click', function () {
  auth.login({
    scope: 'openid profile email phone',
    responseMode: 'fragment',
    responseType: 'code token',
    state: Math.random().toString(),
    nonce: Math.random().toString()
  })
})

document.getElementById('btn-logout').addEventListener('click', function () {
  auth.logout().then((res) => {
    alert(JSON.stringify(res))
    location.reload()
  })
})