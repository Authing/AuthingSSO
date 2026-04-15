import { AuthingSSO } from './index'

const auth = new AuthingSSO({
  appId: '60dd57882376f4bb789dbfe1',

  // SSO 应用面板地址
  origin: 'https://hep-center.u2.hep.com.cn',

  // 应用登录回调 URL
  redirectUri: 'http://localhost:3004/'
})

window.onload = async function () {
  let res = await auth.trackSession()
  await auth.onIdentitySourceLifelongLogin()
  // console.log(etextbookproRes,'etextbookproRes')
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
    responseType: 'code',
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