/**
 * 
 * @param {Object} variables GraphQL 变量
 * @param {String} variables.appId SAMLIdP SSO 应用 id
 */
export default function QuerySAMLServiceProviderInfoByAppID(variables) {
  return {
    operationName: 'QuerySAMLServiceProviderInfoByAppID',
    query: `query QuerySAMLServiceProviderInfoByAppID($appId: String!) {
      QuerySAMLServiceProviderInfoByAppID(appId: $appId) {
        _id
        name
        image
        clientId
        loginUrl: SPUrl
      }
    }`,
    variables
  }
}
