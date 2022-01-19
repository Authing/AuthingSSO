import { AuthzUrlBuilder } from '../AuthzUrlBuilder'

describe('Test AuthzUrlBuilder', () => {
  let authzUrlBuilder: AuthzUrlBuilder

  beforeAll(() => {
    authzUrlBuilder = new AuthzUrlBuilder(
      global.__origin__, 
      global.__appId__, 
      global.__redirectUri__
    )
  })

  test('Init AuthzUrlBuilder', () => {
    expect(authzUrlBuilder).toBeInstanceOf(AuthzUrlBuilder)
  })

  test('Scope function to be called, has no openid', () => {
    expect(() => authzUrlBuilder.scope('email phone')).toThrow()
  })

  // 以下 case 在之前源码中跑不通，已修复
  test('Scope function to be called, missing or multiple ospace', () => {
    expect(() => authzUrlBuilder.scope('email phoneopenid')).toThrow()
    expect(() => authzUrlBuilder.scope('email phone openId')).toThrow()
    expect(authzUrlBuilder.scope(' openid       email phone ')).toBeInstanceOf(AuthzUrlBuilder)
  })

  test('Make sure be returned `this`', () => {
    expect(authzUrlBuilder.redirectUri(global.__redirectUri__)).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.scope('openid phone')).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.responseMode('fragment')).toBeInstanceOf(AuthzUrlBuilder)

    expect(authzUrlBuilder.responseType('id_token token code')).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.responseType('id_token')).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.responseType('token id_token code')).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.responseType(' id_token token    code')).toBeInstanceOf(AuthzUrlBuilder)
    expect(() => authzUrlBuilder.responseType('id_token tokencode')).toThrow()
    
    expect(authzUrlBuilder.clientId(global.__appId__)).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.prompt('consent')).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.state(Math.random().toString())).toBeInstanceOf(AuthzUrlBuilder)
    expect(authzUrlBuilder.nonce(Math.random().toString())).toBeInstanceOf(AuthzUrlBuilder)
  })

  test('build function to be called successfully', () => {
    const stateStr = Math.random().toString()
    const nonceStr = Math.random().toString()
    const scopeStr = 'openid phone'
    const responseModeStr = 'fragment'
    const responseTypeStr = 'token id_token'
    const promptStr = 'login'
    const urls = authzUrlBuilder
      .redirectUri(global.__redirectUri__)
      .scope(scopeStr)
      .responseMode(responseModeStr)
      .responseType(responseTypeStr)
      .clientId(global.__appId__)
      .prompt(promptStr)
      .state(stateStr)
      .nonce(nonceStr)
      .build()
    expect(urls).toBeInstanceOf(URL)
    expect(urls.origin).toBe(global.__origin__)
    expect(urls.pathname).toBe('/oidc/auth')
    expect(urls.search).toBe(
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
})
