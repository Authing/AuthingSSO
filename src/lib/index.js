import 'core-js/modules/es6.promise'
import 'core-js/modules/es6.array.find'
import 'core-js/modules/es6.array.find-index'
import 'core-js/modules/es7.array.includes'
import 'core-js/modules/es6.string.includes'
import 'core-js/modules/es6.string.ends-with'
import 'core-js/modules/es6.string.starts-with'
import 'core-js/modules/es7.object.values'
import 'url-polyfill'

import axios from 'axios'
import GraphQLClient from './graphql'
import queryOAuthAppInfoByAppID from './gql/queryOAuthAppInfoByAppID'
import queryOIDCAppInfoByAppID from './gql/queryOIDCAppInfoByAppID'
import querySAMLServiceProviderInfoByAppID from './gql/querySAMLServiceProviderInfoByAppID'

class AuthingSSO {
  /**
   * @param options.appId {String} SSO 应用 id
   * @param options.appDomain {String} SSO 应用 域名
   * @param options.appType {String} SSO 应用类型
   * @param options.nonce {String} 随机数
   * @param options.timestamp {String} 时间戳
   * @param options.host {Object} 配置 GraphQL 通信地址
   * @param options.host.oauth {Object} OAuth 服务的 GraphQL 地址
   */
  constructor(options) {
    this.options = {
      nonce: Math.random()
        .toString()
        .slice(2, 8),
      timestamp: parseInt(Date.now() / 1000),
      appType: 'oidc',
      responseType: 'code',
      scope: 'openid profile email phone',
      state: Math.random()
        .toString(36)
        .slice(2),
    }
    this.options = Object.assign({}, this.options, options)
    // 开发模式 flag
    this.dev = !!this.options.dev
    // 检查初始化是否传入了必须的参数
    this._checkOptions()
    this.registerURL =
      (this.dev ? 'http://' : 'https://') + this.options.appDomain + '/register'
    this.logoutURL =
      (this.dev ? 'http://' : 'https://') +
      this.options.appDomain +
      '/cas/logout'
    this.trackSessionURL =
      (this.dev ? 'http://' : 'https://') +
      this.options.appDomain +
      '/cas/session'
    this.createSessionURL = (this.dev ? 'http://' : 'https://') +
      this.options.appDomain +
      '/cas/createSession'
    try {
      this.graphQLURL = this.options.host.oauth
    } catch (err) {
      this.graphQLURL = this.dev
        ? 'http://localhost:5510/graphql'
        : 'https://oauth.authing.cn/graphql'
    }
    this.appInfo = this._queryAppInfo()

    // 是否已经从 href 中获取过了 code 和 access_token
    this.stored = false
  }

  // 登录页面可以根据这个 key 识别语言
  static _langStorageKey = '_authing_lang'

  // 根据 SSO 应用的类型和 id 查询相关信息，主要用于生成授权链接
  async _queryAppInfo() {
    let OAuthClient = new GraphQLClient({
      baseURL: this.graphQLURL,
    })
    let mappings = {
      oauth: queryOAuthAppInfoByAppID.bind(this, {
        appId: this.options.appId,
        responseType: this.options.responseType,
        redirectUrl: this.options.redirectUrl,
      }),
      oidc: queryOIDCAppInfoByAppID.bind(this, {
        appId: this.options.appId,
        responseType: this.options.responseType,
        redirectUrl: this.options.redirectUrl,
      }),
      saml: querySAMLServiceProviderInfoByAppID.bind(this, {
        appId: this.options.appId,
      }),
    }
    let mappings2 = {
      oauth: 'QueryAppInfoByAppID',
      oidc: 'QueryOIDCAppInfoByAppID',
      saml: 'QuerySAMLServiceProviderInfoByAppID',
    }
    let appInfo
    if (this.options.appType in mappings) {
      appInfo = await OAuthClient.request(
        mappings[this.options.appType]()
      ).then((res) => {
        return res[mappings2[this.options.appType]]
      })
    } else {
      throw Error('appType 类型错误，可选参数为 oauth oidc saml')
    }
    return appInfo
  }
  _checkOptions() {
    let need = ['appId', 'appDomain', 'appType']
    let keys = Object.keys(this.options)
    for (let i = 0; i < need.length; i++) {
      if (!keys.includes(need[i])) {
        throw Error('AuthingSSO 初始化：缺少 ' + need[i] + ' 参数')
      }
    }
    if (!/^[0-9a-f]{24}$/.test(this.options.appId)) {
      throw Error(
        'appId 格式错误，请在 OAuth、OIDC 或 SAML 应用配置页面查看正确的 appId'
      )
    }
    return true
  }
  login({ lang } = {}) {
    this.appInfo.then((appInfo) => {
      if (!appInfo)
        throw Error(
          'appId 错误，请在 OAuth、OIDC 或 SAML 应用配置页面查看正确的 appId'
        )
      let url = new URL(appInfo.loginUrl)
      url.searchParams.delete('scope')
      url.searchParams.append('scope', this.options.scope)
      url.searchParams.delete('state')
      url.searchParams.append('state', this.options.state)
      if (lang) {
        url.searchParams.append(AuthingSSO._langStorageKey, lang)
      }
      if (~this.options.scope.indexOf('offline_access')) {
        url.searchParams.append('prompt', 'consent')
      }
      location.href = url.href
    })
  }
  register({ lang } = {}) {
    let url = new URL(this.registerURL)
    if (lang) {
      url.searchParams.append(AuthingSSO._langStorageKey, lang)
    }
    location.href = url.href
  }
  // 调用这个方法，会弹出一个 window 里面是 guard 的登录页面
  windowLogin() {
    let leftVal = (screen.width - 500) / 2
    let topVal = (screen.height - 700) / 2
    this.appInfo.then((appInfo) => {
      if (!appInfo)
        throw Error(
          'appId 错误，请在 OAuth、OIDC 或 SAML 应用配置页面查看正确的 appId'
        )
      let url = appInfo.loginUrl
      let popup = window.open(
        url,
        '_blank',
        `width=500,height=700,left=${leftVal},top=${topVal}`
      )
    })
  }

  // authing.cn/#idtoken=123123&access_token=547567
  // 返回 {idtoken: 123123, access_token: 547567}
  getUrlHash() {
    try {
      if (location.hash) {
        let arr = location.hash.substring(1).split('&')
        let result = {}
        arr.forEach((item) => {
          let [key, val] = item.split('=')
          result[key] = val
        })
        return result
      } else {
        return null
      }
    } catch {
      return { err: '获取失败' }
    }
  }
  getUrlQuery() {
    let arr = location.search
      .slice(1)
      .split('&')
      .map((item) => item.split('='))
    let obj = {}
    arr.forEach((item) => {
      obj[item[0]] = item[1]
    })
    return obj
  }
  async logout() {
    let res = await axios.get(this.logoutURL, {
      withCredentials: true,
      headers: {
        'x-authing-oidc-code':
          localStorage.getItem('x-authing-oidc-code') || '',
        'x-authing-oidc-accesstoken':
          localStorage.getItem('x-authing-oidc-accesstoken') || '',
        'x-authing-oauth-code':
          localStorage.getItem('x-authing-oauth-code') || '',
        'x-authing-oauth-accesstoken':
          localStorage.getItem('x-authing-oauth-accesstoken') || '',
      },
    })
    localStorage.removeItem('x-authing-oidc-code')
    localStorage.removeItem('x-authing-oidc-accesstoken')
    localStorage.removeItem('x-authing-oauth-code')
    localStorage.removeItem('x-authing-oauth-accesstoken')
    /**
     * {
     *    code: 200,
     *    message: '单点登出成功'
     * }
     */
    return res.data
  }


  /**
   * @description 用户手动创建 Session
   *
   */
  async createSession(token) {
    const res = await axios.post(this.createSessionURL, {}, {
      headers: {
        token
      }
    })
    return res.data
  }

  /**
   * @description 通过 iframe 请求 OIDC 的 Access Token 和 ID Token
   */
  async getAccessTokenSilently() {
    // 1. Create an iframe:
    const iframe = document.createElement("iframe");
    const redirectURI = this.options.redirectUrl; // Note: Use http://localhost:3000 for demo only!
    const stateString = Math.random().toString().slice(2).toString(16);
    const nonceString = Math.random().toString().slice(2).toString(16);
    const iframeSrcLink = `https://rx4tii-demo.authing.cn/oidc/auth?client_id=${this.options.appId}&redirect_uri=${redirectURI}&response_type=id_token%20token&scope=openid+profile+email+phone&state=${stateString}&response_mode=web_message&nonce=${nonceString}&prompt=none`;
    iframe.title = "postMessage() Initiator";
    iframe.src = iframeSrcLink;
    iframe.hidden = true;
    document.body.append(iframe);
    // 2. Handle the message event initiated by the iframe:
    return new Promise((resolve, reject) => {
      const eventListener = window.addEventListener("message", function (msgEvent) {
        if (msgEvent.data.response.error) {
          reject(new Error(msgEvent.data.response.error_description));
          window.removeEventListener('message', eventListener);
          return;
        }
        const { access_token, id_token } = msgEvent.data.response;
        resolve({ access_token, id_token })
        window.removeEventListener('message', eventListener);
      });
    })
  }

  /**
   * @description 带着 SSO app 的各种信息 + cookie 去请求 appDomain/cas，服务器返回一些用户信息
   */
  async trackSession() {
    if (!this.stored) {
      let queries = this.getUrlQuery()
      let hashes = this.getUrlHash()
      if (this.options.appType === 'oidc') {
        let code = (queries && queries.code) || ''
        let access_tken = (hashes && hashes.access_token) || ''
        if (code) {
          localStorage.setItem('x-authing-oidc-accesstoken', code)
        }
        if (access_tken) {
          localStorage.setItem('x-authing-oidc-accesstoken', access_tken)
        }
      } else if (this.options.appType === 'oauth') {
        let code = (queries && queries.code) || ''
        let access_tken = (hashes && hashes.access_token) || ''
        if (code) {
          localStorage.setItem('x-authing-oauth-code', code)
        }
        if (access_tken) {
          localStorage.setItem('x-authing-oauth-accesstoken', access_tken)
        }
      }

      this.stored = true
    }

    let res = await axios.get(this.trackSessionURL, {
      withCredentials: true,
      headers: {
        'x-authing-oidc-code':
          localStorage.getItem('x-authing-oidc-accesstoken') || '',
        'x-authing-oidc-accesstoken':
          localStorage.getItem('x-authing-oidc-accesstoken') || '',
        'x-authing-oauth-code':
          localStorage.getItem('x-authing-oauth-code') || '',
        'x-authing-oauth-accesstoken':
          localStorage.getItem('x-authing-oauth-accesstoken') || '',
      },
    })
    if (res.data.session) {
      let paramsDocs = {
        'OIDC code 使用文档':
          'https://docs.authing.cn/authing/advanced/oidc/oidc-authorization#shi-yong-code-huan-qu-token', // 当 response_type 为 code 且 appType 为 oidc 时显示
        'OIDC 本地验证 access_token 和 id_token 的方式':
          'https://docs.authing.cn/authing/advanced/authentication/verify-jwt-token#oidc-secret-token', // 当应用类型为 OIDC 应用时且 response_type 为 code 时显示
        'OAuth access_token 合法性在线验证':
          'https://docs.authing.cn/authing/advanced/authentication/verify-jwt-token#yan-zheng-oauth-accesstoken-he-fa-xing', // 当应用类型为 OAuth 应用时显示
        'OIDC access_token 和 id_token 合法性在线验证':
          'https://docs.authing.cn/authing/advanced/authentication/verify-jwt-token#yan-zheng-oidc-accesstoken-huo-idtoken-de-he-fa-xing', // 当应用类型为 OIDC 应用时显示
      }
      if (this.options.appType === 'oidc') {
        paramsDocs = {
          'OIDC 本地验证 access_token 和 id_token 的方式':
            'https://docs.authing.cn/authing/advanced/authentication/verify-jwt-token#oidc-secret-token', // 当应用类型为 OIDC 应用时且 response_type 为 code 时显示
          'OIDC access_token 和 id_token 合法性在线验证':
            'https://docs.authing.cn/authing/advanced/authentication/verify-jwt-token#yan-zheng-oidc-accesstoken-huo-idtoken-de-he-fa-xing', // 当应用类型为 OIDC 应用时显示
        }
        if (this.options.responseType === 'code') {
          paramsDocs['OIDC code 使用文档'] =
            'https://docs.authing.cn/authing/advanced/oidc/oidc-authorization#shi-yong-code-huan-qu-token'
        } else if (this.options.responseType === 'implicit') {
          paramsDocs['OIDC implicit 文档'] =
            'https://docs.authing.cn/authing/advanced/oidc/oidc-authorization#shi-yong-yin-shi-liu-cheng-implicit-flow'
        }
      } else if (this.options.appType === 'oauth') {
        paramsDocs = {
          'OAuth access_token 合法性在线验证':
            'https://docs.authing.cn/authing/advanced/authentication/verify-jwt-token#yan-zheng-oauth-accesstoken-he-fa-xing', // 当应用类型为 OAuth 应用时显示
        }
        if (this.options.responseType === 'code') {
          paramsDocs['OAuth code 使用文档'] =
            'https://docs.authing.cn/authing/advanced/oauth2/oauth-authorization#shi-yong-authorizationcode-mo-shi'
        } else if (this.options.responseType === 'implicit') {
          paramsDocs['OAuth implicit 文档'] =
            'https://learn.authing.cn/authing/advanced/oauth2/oauth-authorization#implicit-mo-shi'
        }
      }

      let queries = {}
      if (this.options.responseType === 'code') {
        queries = this.getUrlQuery()
        queries = { code: queries.code }
      } else if (this.options.responseType === 'implicit') {
        queries = this.getUrlHash()
        if (queries)
          queries = {
            access_token: queries.access_token,
            id_token: queries.id_token,
          }
      }
      /**
       * userId 用户 id
       * appId SSO 应用的 id
       * type SSO 应用的类型 oidc saml oauth
       */
      res.data.userInfo['__Token 验证方式说明'] =
        'https://docs.authing.cn/authing/advanced/authentication/verify-jwt-token#fa-song-token-gei-authing-fu-wu-qi-yan-zheng'
      return {
        ...res.data,
        urlParams: {
          ...queries,
          __参数使用说明: paramsDocs,
          __authing_hint:
            'code token id_token 字段只会在第一次回调到业务地址的时候从 url 取出，请自行存储以备使用',
        },
      }
    }
    return res.data
  }
}

export default AuthingSSO
