/**
 * 
 * @param {Object} variables GraphQL 变量
 * @param {String} variables.appId OAuth SSO 应用 id
 */
export default function QueryOAuthAppInfoByAppID(variables) {
  return {
    operationName: 'QueryAppInfoByAppID',
    query: `query QueryAppInfoByAppID($appId: String, $responseType: String, $redirectUrl: String){
      QueryAppInfoByAppID(appId: $appId, responseType: $responseType, redirectUrl: $redirectUrl) {
        _id
        name
        image
        clientId
        css
        loginUrl
      }
    }`,
    variables
  }
}