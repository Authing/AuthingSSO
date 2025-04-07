export interface IAuthingSSOConstructorParams {
  appId: string;
  origin: string;
  redirectUri: string;
}

export interface PopUpLoginSuccessParams {
  access_token: string;
  id_token: string;
}

export interface PopUpLoginFailParams {
  error: string;
  error_description: string;
}

export interface DataParams {
  code: number;
  data: any;
  message: string;
}

export interface GetTokenParams {
  error?: string;
  error_description?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  birthdate?: string;
  family_name?: string;
  gender?: string;
  given_name?: string;
  locale?: string;
  middle_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  preferred_username?: string;
  profile?: string;
  updated_at?: string;
  website?: string;
  zoneinfo?: string;
  [proppName: string]: any;
}

export interface emptyObjParams {
  access_token?: string;
  id_token?: string;
  code?: string;
  state?: string;
}

// 定义交互方式：
export type IPromptType =
  | "none" // 永远不提示用户做任何登录，无需输密码
  | "consent" // 每次用户认证完后都要进行二次确认
  | "login"; // 默认值
export interface IPopUpLoginParams {
  scope?: string;
  responseMode?: string;
  responseType?: string;
  nonce?: string;
  state?: string;
  prompt?: IPromptType;
  login_hint?: string;
}

export interface IGetAccessTokenSilentlyParams extends IPopUpLoginParams {}

export interface ILoginParams extends IPopUpLoginParams {}
