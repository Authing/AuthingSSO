import axios from "axios";
import GraphQLClient from "./graphql";
import queryOAuthAppInfoByAppID from "./gql/queryOAuthAppInfoByAppID";
import queryOIDCAppInfoByAppID from "./gql/queryOIDCAppInfoByAppID";
import querySAMLServiceProviderInfoByAppID from "./gql/querySAMLServiceProviderInfoByAppID";
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
      appType: "oidc"
    };
    this.options = { ...this.options, ...options };
    // 开发模式 flag
    this.dev = !!this.options.dev;
    // 检查初始化是否传入了必须的参数
    this._checkOptions();
    this.logoutURL =
      (this.dev ? "http://" : "https://") +
      this.options.appDomain +
      "/cas/logout";
    this.trackSessionURL =
      (this.dev ? "http://" : "https://") +
      this.options.appDomain +
      "/cas/session";
    try {
      this.graphQLURL = this.options.host.oauth;
    } catch (err) {
      this.graphQLURL = this.dev
        ? "http://localhost:5556/graphql"
        : "https://oauth.authing.cn/graphql";
    }
    this.appInfo = this._queryAppInfo();
  }
  // 根据 SSO 应用的类型和 id 查询相关信息，主要用于生成授权链接
  async _queryAppInfo() {
    let OAuthClient = new GraphQLClient({
      baseURL: this.graphQLURL
    });
    let mappings = {
      oauth: queryOAuthAppInfoByAppID.bind(this, { appId: this.options.appId }),
      oidc: queryOIDCAppInfoByAppID.bind(this, { appId: this.options.appId }),
      saml: querySAMLServiceProviderInfoByAppID.bind(this, {
        appId: this.options.appId
      })
    };
    let mappings2 = {
      oauth: "QueryAppInfoByAppID",
      oidc: "QueryOIDCAppInfoByAppID",
      saml: "QuerySAMLServiceProviderInfoByAppID"
    };
    let appInfo;
    if (this.options.appType in mappings) {
      appInfo = await OAuthClient.request(
        mappings[this.options.appType]()
      ).then(res => {
        return res[mappings2[this.options.appType]];
      });
    } else {
      throw Error("appType 类型错误，可选参数为 oauth oidc saml");
    }
    return appInfo;
  }
  _checkOptions() {
    let need = ["appId", "appDomain", "appType"];
    let keys = Object.keys(this.options);
    for (let i = 0; i < need.length; i++) {
      if (!keys.includes(need[i])) {
        throw Error("AuthingSSO 初始化：缺少 " + need[i] + " 参数");
      }
    }
    if (!/^[0-9a-f]{24}$/.test(this.options.appId)) {
      throw Error(
        "appId 格式错误，请在 OAuth、OIDC 或 SAML 应用配置页面查看正确的 appId"
      );
    }
    return true;
  }
  login() {
    this.appInfo.then(appInfo => {
      if (!appInfo)
        throw Error(
          "appId 错误，请在 OAuth、OIDC 或 SAML 应用配置页面查看正确的 appId"
        );
      let url = appInfo.loginUrl;
      location.href = url;
    });

    // let leftVal = (screen.width - 500) / 2;
    // let topVal = (screen.height - 700) / 2;
    // 打开新窗口进行登录，把信息通过 PostMessage 发送给前端，开发者需要监听 message 事件
    // let popup = window.open(
    //   url,
    //   "_blank",
    //   `width=500,height=700,left=${leftVal},top=${topVal}`
    // );
    // let timer = setInterval(function() {
    //   // 每秒检查登录窗口是否已经关闭
    //   if (popup.closed) {
    //     clearInterval(timer);

    //   }
    // }, 1000);
  }
  // 调用这个方法，会弹出一个 window 里面是 guard 的登录页面
  windowLogin() {}
  // authing.cn/#idtoken=123123&access_token=547567
  // 返回 {idtoken: 123123, access_token: 547567}
  getUrlHash() {
    try {
      let arr = location.hash.substring(1).split("&");
      let result = {};
      arr.forEach(item => {
        let [key, val] = item.split("=");
        result[key] = val;
      });
      return result;
    } catch {
      return { err: "获取失败" };
    }
  }
  async logout() {
    let res = await axios.get(this.logoutURL, {
      withCredentials: true
      // headers: {
      //   appId: this.options.clientId,
      //   appDomain: this.options.appDomain
      // }
    });
    /**
     * {
     *    code: 200,
     *    message: '单点登出成功'
     * }
     */
    return res.data;
  }
  /**
   * @description 带着 SSO app 的各种信息 + cookie 去请求 appDomain/cas，服务器返回一些用户信息
   */
  async trackSession() {
    let res = await axios.get(this.trackSessionURL, {
      withCredentials: true
      // headers: {
      //   appId: this.options.clientId,
      //   appDomain: this.options.appDomain
      // }
    });
    /**
     * userId 用户 id
     * appId SSO 应用的 id
     * type SSO 应用的类型 oidc saml oauth
     */
    return res.data;
  }
}

export default AuthingSSO;
