import { AuthingSSO } from './index'

const auth = new AuthingSSO({
  appId: '60dd57882376f4bb789dbfe1',

  // SSO 应用面板地址
  origin: 'https://hep-center.u2.hep.com.cn',


  // appId: '69e610c3acfa67f8d46109ce',

  // // SSO 应用面板地址
  // origin: 'https://test.authing.localhost',


  // 应用登录回调 URL
  redirectUri: 'http://localhost:3004/'
})

window.onload = async function () {

  let etextbookproRes = await auth.onIdentitySourceVerifLogin({
    ext_idp_conn_id: '69c4acdc5e538db374a7021e',
    referrer: 'https://lifelong.smartedu.cn'
  })

  console.log(etextbookproRes,'etextbookproRes')
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
