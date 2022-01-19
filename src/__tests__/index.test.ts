import { AuthingSSO } from '../index'

describe('Test AuthingSSO', () => {
  let auth: AuthingSSO
  let location = JSON.stringify(window.location)

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {}
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: JSON.parse(location)
    })
  })

  beforeAll(() => {
    jest.spyOn(window, 'open')

    auth = new AuthingSSO({
      appId: global.__appId__,
      origin: global.__origin__,
      redirectUri: global.__redirectUri__
    })
  })

  test('Init AuthingSSO', () => {
    expect(auth).toBeInstanceOf(AuthingSSO)
  })
  
  // 非 Electron
  test('register function to be called', () => {    
    auth.register()
    expect(window.open).not.toBeCalled()
  })

  test('login function to be called', () => {
    const stateStr = Math.random().toString()
    const nonceStr = Math.random().toString()
    const scopeStr = 'openid phone'
    const responseModeStr = 'fragment'
    const responseTypeStr = 'token id_token'
    const promptStr = 'login'

    auth.login({
      scope: scopeStr,
      responseMode: responseModeStr,
      responseType: responseTypeStr,
      state: stateStr,
      nonce: nonceStr,
      prompt: promptStr
    })

    const url = auth.authzUrlBuilder
      .redirectUri(global.__redirectUri__)
      .scope(scopeStr)
      .responseMode(responseModeStr)
      .responseType(responseTypeStr)
      .clientId(global.__appId__)
      .prompt(promptStr)
      .state(stateStr)
      .nonce(nonceStr)
      .build()

    expect(url.search).toBe(
      `?redirect_uri=${encodeURIComponent(global.__redirectUri__)}`+
      `&scope=${scopeStr.split(' ').filter(item => !!item).join('+')}`+
      `&response_mode=${responseModeStr}`+
      `&response_type=${responseTypeStr.split(' ').filter(item => !!item).sort().join('+')}`+
      `&client_id=${global.__appId__}`+
      `&prompt=${promptStr}`+
      `&state=${stateStr}`+
      `&nonce=${nonceStr}`
    )
  })

  test('getUserInfoByAccessToken to be called', async () => {
    // 源码中原先 if 中用的是 &&，现已改成 ||
    try {
      await auth.getUserInfoByAccessToken('')
    } catch (e) {
      expect(e.message).toBe('请传入正确的 access_token')
    }
  })

  test('getAccessTokenSilently to be called', async () => {

  })
})
