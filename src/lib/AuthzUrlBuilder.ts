import { InvalidParamsError } from "../errors/InvalidParamsError";
import { IPromptType } from "../interfaces/IAuthingSSOConstructorParams";
export class AuthzUrlBuilder {
  private _clientId: string;
  private _origin: string;
  private _redirectUri: string;
  private _responseType: string = "code";
  private _responseMode: string = "fragment";
  private _prompt: string | undefined;
  private _state: string = Math.random().toString();
  private _nonce: string;
  private _scope: string = "openid email phone profile offline_access";
  private _loginPageContext: string;

  constructor(origin: string, appid: string, redirectUri: string) {
    if (!origin) {
      throw new InvalidParamsError(
        "URL 构造器必须传入 origin，值为通信 URL 的域，例如：https://userpool1.authing.cn"
      );
    }
    if (!appid) {
      throw new InvalidParamsError("URL 构造器必须传入 clientid");
    }
    if (!redirectUri) {
      throw new InvalidParamsError("URL 构造器必须传入 redirectUri");
    }
    this._origin = origin;
    this._redirectUri = redirectUri;
    this._clientId = appid;
  }

  build() {
    let urls = new URL(this._origin);

    urls.pathname = "/oidc/auth";

    urls.searchParams.append("redirect_uri", this._redirectUri);
    urls.searchParams.append("scope", this._scope);
    urls.searchParams.append("response_mode", this._responseMode);
    urls.searchParams.append("response_type", this._responseType);
    urls.searchParams.append("client_id", this._clientId);
    urls.searchParams.append("login_page_context", this._loginPageContext);

    if (this._prompt) {
      urls.searchParams.append("prompt", this._prompt);
    }

    if (this._state) {
      urls.searchParams.append("state", this._state);
    }

    if (this._nonce) {
      urls.searchParams.append("nonce", this._nonce);
    }

    return urls;
  }

  redirectUri(url: string) {
    this._redirectUri = encodeURI(url);
    return this;
  }

  scope(params: string) {
    const openidRequiredMessage = "AuthingSSO error: scope 必须传递 openid";

    if (!params) {
      throw new InvalidParamsError(openidRequiredMessage);
    }

    const _params: string[] = params.split(" ").filter((item) => !!item);

    if (_params.includes("offline_access")) {
      this._prompt = "consent";
    }

    if (_params.includes("openid")) {
      this._scope = _params.join(" ");
      return this;
    }

    throw new InvalidParamsError(openidRequiredMessage);
  }

  responseMode(params: string) {
    this._responseMode = params;
    return this;
  }

  responseType(params: string) {
    this._responseType = params;
    return this;
  }

  clientId(appId: string) {
    this._clientId = appId;
    return this;
  }

  prompt(params: IPromptType) {
    this._prompt = params;
    return this;
  }

  state(timestamp: string) {
    this._state = timestamp;
    return this;
  }

  nonce(rand: string) {
    this._nonce = rand;
    return this;
  }
  loginPageContext(context: string) {
    this._loginPageContext = context;
    return this;
  }
}
