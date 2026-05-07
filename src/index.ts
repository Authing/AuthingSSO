import "url-polyfill";
import { InvalidParamsError } from "./errors/InvalidParamsError";
import { AuthenticationError } from "./errors/AuthenticationError";
import {
  IAuthingSSOConstructorParams,
  IGetAccessTokenSilentlyParams,
  PopUpLoginSuccessParams,
  PopUpLoginFailParams,
  IPopUpLoginParams,
  GetTokenParams,
  emptyObjParams,
  ILoginParams,
  DataParams,
} from "./interfaces/IAuthingSSOConstructorParams";
import { AuthzUrlBuilder } from "./lib/AuthzUrlBuilder";
import { isInElectron, isIE, getReferrerOrigin } from "./utils/index";
import axios, { Axios } from "axios";
import { EXCHANGEUSERINFO, LOGOUT, TRACKSESSION, MATCH_CONN } from "./utils/api";

export { PopUpLoginError } from "./errors/PopUpLoginError";
export { AuthenticationError } from "./errors/AuthenticationError";
export { InvalidParamsError } from "./errors/InvalidParamsError";
export class AuthingSSO {
  private appId: string;
  private origin: string;
  private redirectUri: string;

  private popUpLoginFailCallback: (
    options: PopUpLoginFailParams
  ) => Promise<void> = () => {
    return Promise.resolve();
  };

  private popUpLoginSuccessCallback: (
    options: PopUpLoginSuccessParams
  ) => Promise<void> = () => {
    return Promise.resolve();
  };

  private popUpLoginCancelCallback: () => Promise<void> = () => {
    return Promise.resolve();
  };

  private _axios: Axios;
  private win: Window;
  private loginStatus: string;
  public authzUrlBuilder: AuthzUrlBuilder;

  constructor(options: IAuthingSSOConstructorParams) {
    if (!options.appId) {
      throw new InvalidParamsError("请传入 appId 参数，请传入应用 ID");
    }

    if (!options.redirectUri) {
      throw new InvalidParamsError("请传入 redirectUri 参数，值为业务回调地址");
    }

    if (!options.origin) {
      throw new InvalidParamsError(
        "请传入 origin 参数，值为用户池域名 URL，例：https://userpool1.authing.cn"
      );
    }

    this.appId = options.appId;
    this.origin = options.origin;
    this.redirectUri = options.redirectUri;

    this.authzUrlBuilder = new AuthzUrlBuilder(
      this.origin,
      this.appId,
      this.redirectUri
    );

    this._axios = axios.create({
      baseURL: this.origin,
    });

    this.loginStatus = "0"; //0 未登录 1 成功 2 失败 3 取消 4 登录中
  }

  /**
   * @msg: 注册方法
   * @param {*}
   */
  register(options: ILoginParams) {
    // let url = new URL(this.origin + '/register')
    const registerContext = {
      goto: "/register",
    };

    const { scope, responseMode, responseType, prompt, state, nonce } =
      Object.assign(
        {},
        {
          scope: "openid profile email phone",
          responseMode: "fragment",
          responseType: "id_token token",
          nonce: Math.random().toString(),
        },
        options
      );

    let url = this.authzUrlBuilder
      .redirectUri(this.redirectUri)
      .scope(scope)
      .responseMode(responseMode)
      .responseType(responseType)
      .clientId(this.appId)
      .prompt(prompt)
      .state(state)
      .nonce(nonce)
      .loginPageContext(JSON.stringify(registerContext))
      .build();

    if (isInElectron) {
      window.open(url.href);
    } else {
      window.location.href = url.href;
    }
  }

  /**
   * @msg: 登录方法
   * @param {*}
   */
  login(options: ILoginParams) {
    const {
      scope,
      responseMode,
      responseType,
      prompt,
      state,
      nonce,
      login_hint,
    } = Object.assign(
      {},
      {
        scope: "openid profile email phone",
        responseMode: "fragment",
        responseType: "id_token token",
      },
      options
    );

    let url = this.authzUrlBuilder
      .redirectUri(this.redirectUri)
      .scope(scope)
      .responseMode(responseMode)
      .responseType(responseType)
      .clientId(this.appId)
      .prompt(prompt)
      .state(state)
      .nonce(nonce)
      .loginHint(login_hint)
      .build();

    if (isInElectron) {
      window.open(url.href);
    } else {
      window.location.href = url.href;
    }
  }

  /**
   * @msg: 弹窗登录
   * @param {*}
   */
  popUpLogin(
    {
      scope,
      responseMode,
      responseType,
      state,
      nonce,
      prompt,
      iframeParams = {
        width: 500,
        height: 700,
      },
    }: IPopUpLoginParams = {
      scope: "openid profile email phone",
      responseMode: "web_message",
      responseType: "id_token token",
      state: Math.random().toString(),
      nonce: Math.random().toString(),
      prompt: undefined,
      iframeParams: {
        width: 500,
        height: 700,
      },
    }
  ) {
    const _this = this;
    _this.loginStatus = "4";
    const msgEventListener: any = window.addEventListener(
      "message",
      function (msgEvent) {
        if (msgEvent.data?.response?.error) {
          const { error, error_description } = msgEvent.data.response;
          window.removeEventListener("message", msgEventListener);
          _this.loginStatus = "2";
          _this.popUpLoginFailCallback({ error, error_description });
        }
        if (msgEvent.data?.response) {
          const { access_token, id_token } = msgEvent.data.response;
          _this.popUpLoginSuccessCallback({ access_token, id_token });
          window.removeEventListener("message", msgEventListener);
          _this.loginStatus = "1";
        }
      }
    );

    let url = this.authzUrlBuilder
      .redirectUri(this.redirectUri)
      .scope(scope)
      .responseMode(responseMode)
      .responseType(responseType)
      .clientId(this.appId)
      .state(state)
      .prompt(prompt)
      .nonce(nonce)
      .build();

    const { width, height, top, left, styles } = iframeParams;

    let leftVal = left ?? (screen.width - width) / 2;
    let topVal = top ?? (screen.height - height) / 2;

    this.win = window.open(
      url.href,
      "_blank",
      `width=${width},height=${height},left=${leftVal},top=${topVal},${styles}`
    );
    var loop = setInterval(function () {
      if (_this.win && _this.win.closed) {
        if (_this.loginStatus === "4") {
          _this.popUpLoginCancelCallback();
        }
        clearInterval(loop);
        _this.loginStatus = "3";
        window.removeEventListener("message", msgEventListener);
      }
    }, 1000);
  }

  /**
   * @msg: 弹窗登录成功方法
   * @param {PopUpLoginSuccessParams} access_token: string
   * @param {PopUpLoginSuccessParams} id_token: string
   */
  async onPopUpLoginSuccess(
    cb: (options: PopUpLoginSuccessParams) => Promise<void>
  ): Promise<void> {
    this.popUpLoginSuccessCallback = cb;
  }

  /**
   * @msg: 弹窗登录失败方法
   * @param {PopUpLoginFailParams} error: string
   * @param {PopUpLoginFailParams} error_description: string
   */
  async onPopUpLoginFail(
    cb: (options: PopUpLoginFailParams) => Promise<void>
  ): Promise<void> {
    this.popUpLoginFailCallback = cb;
  }

  /**
   * @msg: 弹窗登录取消方法
   */
  async onPopUpLoginCancel(cb: () => Promise<void>): Promise<void> {
    this.popUpLoginCancelCallback = cb;
  }

  /**
   * @msg: 获取用户信息方法
   * @param  access_token: string
   */
  async getUserInfoByAccessToken(access_token: string) {
    if (!access_token || typeof access_token !== "string") {
      throw new InvalidParamsError("请传入正确的 access_token");
    }

    let res: GetTokenParams = await this._axios.get(EXCHANGEUSERINFO, {
      params: { access_token: access_token },
    });

    if (res && res.status === 200) {
      if (res.data.error && res.data.error_description) {
        throw new AuthenticationError(res.data.error_description);
      }
      return res.data;
    } else {
      throw new AuthenticationError(res.data.error_description);
    }
  }

  /**
   * @msg: 获取用户token
   * @param {*}
   */
  getAccessTokenSilently(
    {
      scope,
      responseMode,
      responseType,
      state,
      nonce,
      prompt,
    }: IGetAccessTokenSilentlyParams = {
      scope: "openid profile email phone",
      responseMode: "web_message",
      responseType: "id_token token",
      state: Math.random().toString(),
      nonce: Math.random().toString(),
      prompt: "none",
    }
  ) {
    let url = this.authzUrlBuilder
      .redirectUri(this.redirectUri)
      .scope(scope)
      .responseMode(responseMode)
      .responseType(responseType)
      .clientId(this.appId)
      .prompt(prompt)
      .state(state)
      .nonce(nonce)
      .build();

    const iframe = document.createElement("iframe");
    iframe.title = "postMessage() Initiator";
    iframe.src = url.href;
    iframe.hidden = true;
    if (isIE()) {
      document.body.appendChild(iframe);
    } else {
      document.body.append(iframe);
    }

    return new Promise((resolve, reject) => {
      const msgEventListener: any = window.addEventListener(
        "message",
        (msgEvent) => {
          if (msgEvent.data?.response?.error) {
            window.removeEventListener("message", msgEventListener);
            iframe.remove();
            reject(
              new AuthenticationError(msgEvent.data.response.error_description)
            );
            return;
          }
          if (msgEvent.data?.response) {
            const { access_token, id_token } = msgEvent.data.response;
            window.removeEventListener("message", msgEventListener);
            iframe.remove();
            resolve({ access_token, id_token });
          }
        }
      );
    });
  }

  /**
   * @msg: 退出登录
   * @param {*}
   */
  async logout() {
    let res: DataParams = await this._axios.get(LOGOUT, {
      withCredentials: true,
    });
    if (res && res.data && res.data.code === 200) {
      return res.data;
    } else {
      throw new AuthenticationError(res.data.message);
    }
  }

  /**
   * @msg: get url hash
   * @param {*}
   */
  getTokenSetFromUrlHash() {
    try {
      if (location.hash) {
        let arr = location.hash.substring(1).split("&");
        let result: emptyObjParams = {};
        arr.forEach((item) => {
          let [key, val] = item.split("=");
          result[key] = val;
        });
        return result;
      } else {
        return null;
      }
    } catch {
      throw new AuthenticationError("获取 hash 失败");
    }
  }

  /**
   * @description 跨域携带 cookie 访问 /cas/session 端点，获取当前登录的用户信息
   */
  async trackSession() {
    let res = await this._axios.get(TRACKSESSION, {
      withCredentials: true,
      headers: { "x-authing-app-id": this.appId },
    });
    return res.data;
  }

  async loginEtextbookpro(ext_idp_conn_id : string) {

    this.authzUrlBuilder.reset();
    let url = this.authzUrlBuilder
      .redirectUri(this.redirectUri)
      .scope("openid profile email phone")
      .responseType("code")
      .clientId(this.appId)
      .state(Math.random().toString())
      .nonce(Math.random().toString())
      .extIdpConnId(ext_idp_conn_id)
      .build();
    if (isInElectron) {
      window.open(url.href);
    } else {
      window.location.href = url.href;
    }
  }

  /**
   * @description iframe 静默登录（适用于高教社场景）
   * @returns Promise<{ access_token?: id_token?: string string; error?: string; }>
   *   - 成功：返回 { access_token, id_token }
   *   - 失败：返回 { error: 'login_required' | 'timeout' | 'invalid_state' }
   */
  async loginIdentitySource(
    params: IGetAccessTokenSilentlyParams & {
      ext_idp_conn_id?: string;
      isPrompt?: boolean;
    } = {},
  ): Promise<{ access_token?: string; id_token?: string; error?: string }> {
    const {
      scope = "openid profile email phone",
      responseMode = "web_message",
      responseType = "id_token token",
      state = Math.random().toString(),
      nonce = Math.random().toString(),
      ext_idp_conn_id,
      isPrompt,
    } = params;

    this.authzUrlBuilder.reset();
    let builder = this.authzUrlBuilder
      .redirectUri(this.redirectUri)
      .scope(scope)
      .responseMode(responseMode)
      .responseType(responseType)
      .clientId(this.appId)
      .state(state)
      .nonce(nonce);

    if (isPrompt) {
      builder = builder.prompt('none');
    }
    if (ext_idp_conn_id) {
      builder = builder.extIdpConnId(ext_idp_conn_id);
    }

    let url = builder.build();

    const iframe = document.createElement("iframe");
    iframe.title = "postMessage() Initiator";
    iframe.src = url.href;
    iframe.hidden = true;
    console.log( url.href,' url.href url.href debugger')
    if (isIE()) {
      document.body.appendChild(iframe);
    } else {
      document.body.append(iframe);
    }

    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;

      const cleanup = () => {
        clearTimeout(timeoutId);
        window.removeEventListener("message", messageHandler);
        // iframe.remove();
      };

      const messageHandler = (msgEvent: MessageEvent) => {
        // 安全校验：验证消息来源
        if (msgEvent.origin !== this.origin) return;
        if (msgEvent.data?.response?.error) {
          cleanup();
          reject({ error: "login_required" });
          return;
        }
        if (msgEvent.data?.response) {
          const { access_token, id_token } = msgEvent.data.response;
          cleanup();
          resolve({ access_token, id_token });
        } else {
          cleanup();
          reject({ error: "login_required" });
          return;
        }
      };

      // 设置超时
      timeoutId = setTimeout(() => {
        cleanup();
        reject({ error: "timeout" });
      }, 5000); // 5 秒超时

      window.addEventListener("message", messageHandler);
    });
  }



  async onIdentitySourceVerifLogin(params?: {
    ext_idp_conn_id?: string;
    referrer?: string;
  }) {
    let ext_idp_conn_id = params?.ext_idp_conn_id || "";

    let referrerReferrer =  getReferrerOrigin()

    // 如果传入的 ext_idp_conn_id 存在，优先使用
    if (!params?.ext_idp_conn_id) {
      // 调用接口获取 ext_idp_conn_id
      const domain = params?.referrer || referrerReferrer || "https://lifelong.smartedu.cn/";
      const matchConnRes: any = await this._axios.get(MATCH_CONN, {
        params: {
          app_id: this.appId,
          domain: domain,
        },
        withCredentials: true,
        headers: { "x-authing-app-id": this.appId },
      });

      if (matchConnRes?.data?.code !== 200 || !matchConnRes?.data?.data?.connId) {
        console.error("获取 ext_idp_conn_id 失败:", matchConnRes?.data);
      } else {
        ext_idp_conn_id = matchConnRes?.data?.data?.connId;
      }
    }

    if(!ext_idp_conn_id){
      return null
    }


    // 如果传入的 ext_idp_conn_id 存在，优先使用

    if (params?.referrer ) {
      console.log(params?.referrer,referrerReferrer,'referrerparams debugger')
      if(params?.referrer !== referrerReferrer){
        // return null
      }
    }


    try {
      let isPrompt = false;
      const tokenResult = await this.loginIdentitySource({ext_idp_conn_id,isPrompt});

      console.log(tokenResult,'tokenResulttokenResult debugger')

      const { id_token, access_token } = tokenResult as {
        id_token: string;
        access_token: string;
      };

      // iframe 静默登录失败（用户未登录），fallback 到跳转登录
      if (!access_token || !id_token) {
        this.loginEtextbookpro(ext_idp_conn_id);
      }else{
        return tokenResult
      }
    } catch (e) {
      // iframe 登录异常，fallback 到跳转登录
      console.log(e,'eeeeeeee debugger')
      // this.loginEtextbookpro(ext_idp_conn_id);
    }
  }
}
