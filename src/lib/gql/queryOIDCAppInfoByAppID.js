/**
 * 
 * @param {Object} variables GraphQL 变量
 * @param {String} variables.appId OIDC SSO 应用 id
 */
export default function QueryOIDCAppInfoByAppID(variables) {
  return {
    operationName: 'QueryOIDCAppInfoByAppID',
    query: `query QueryOIDCAppInfoByAppID($appId: String, $responseType: String) {
      QueryOIDCAppInfoByAppID(appId: $appId, responseType: $responseType) {
        _id
        name
        image
        client_id
        redirect_uris
        domain
        css
        loginUrl
      }
    }`,
    variables
  }
}
