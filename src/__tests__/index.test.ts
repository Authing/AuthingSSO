import { AuthingSSO } from '../index'
import mockAxios from 'axios'
import { EXCHANGEUSERINFO, LOGOUT, TRACKSESSION } from '../utils/api'

const apiMap = require('../__apis__')

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
    jest.spyOn(document.body, 'append')

    /** @ts-ignore */
    mockAxios.get.mockImplementation((url, config) => {
      const response = apiMap[url]
      return Promise.resolve(response)
    })

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
    const stateStr = Math.random().toString()
    const nonceStr = Math.random().toString()
    const scopeStr = 'openid phone'
    const responseModeStr = 'fragment'
    const responseTypeStr = 'token id_token'
    const promptStr = 'login'
    auth.register({
      scope: scopeStr,
      responseMode: responseModeStr,
      responseType: responseTypeStr,
      state: stateStr,
      nonce: nonceStr,
      prompt: promptStr
    })
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
  })

  test('getUserInfoByAccessToken to be called, access_token is invalid', async () => {
    // 源码中原先 if 中用的是 &&，现已改成 ||
    try {
      await auth.getUserInfoByAccessToken('')
    } catch (e) {
      expect(e.message).toBe('请传入正确的 access_token')
    }
  })

  test('getUserInfoByAccessToken to be called, response successfully', async () => {
    try {
      const data = await auth.getUserInfoByAccessToken('access_token')
      expect(data).toEqual(apiMap[EXCHANGEUSERINFO])
    } catch (e) {}
  })

  test('getAccessTokenSilently to be called', () => {
    // 删除了源码中多余的 if 判断，这个在 constructor 中已经有判断了
    const scopeStr = 'openid profile email phone'
    const responseModeStr = 'web_message'
    const responseTypeStr = 'id_token token'
    const stateStr = Math.random().toString()
    const nonceStr = Math.random().toString()
    const promptStr = 'none'

    auth.getAccessTokenSilently({
      scope: scopeStr,
      responseMode: responseModeStr,
      responseType: responseTypeStr,
      state: stateStr,
      nonce: nonceStr,
      prompt: promptStr
    })

    // 与源码中执行顺序对齐
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

    const iframe = document.createElement('iframe')
    iframe.title = 'postMessage() Initiator'
    iframe.src = url.href
    iframe.hidden = true
    expect(document.body.append).toBeCalledWith(iframe)
  })

  // logout 单纯只是 http 请求，没有其他逻辑操作
  test('logout to be called', async () => {
    const data = await auth.logout()
    expect(data.message).toBe(apiMap[LOGOUT].data.message)
  })

  test('getTokenSetFromUrlHash to be called', () => {
    const hash = window.location.hash

    window.location.hash = '#a=1&b=2&c=3'

    const result = auth.getTokenSetFromUrlHash()
    const arr = window.location.hash.substring(1).split('&')
    const params = {}
    arr.forEach((item) => {
      let [key, val] = item.split('=')
      params[key] = val
    })

    expect(result).toEqual(params)

    // 对于全局变量的临时修改，用完之后一定要重置回去
    window.location.hash = hash
  })

  test('trackSession to be called', async () => {
    const data = await auth.trackSession()
    expect(data).toEqual(apiMap[TRACKSESSION].data)
  })
})
