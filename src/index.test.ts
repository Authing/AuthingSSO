import { AuthingSSO } from './index';

test('初始化 AuthingSSO', () => {
  expect(
    new AuthingSSO({
      appId: '1',
      origin: 'https://oidc1.authing.cn',
      redirectUri: 'https://authing.cn',
    })
  ).toBeInstanceOf(AuthingSSO);
});
