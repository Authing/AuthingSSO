<template>
  <div id="app">
    <button @click="register">Register</button>
    <button @click="handleLogin">Login</button>
    <button @click="handleWindowLogin">windowLogin</button>
    <button @click="handleTrackSession">trackSession</button>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script>
import AuthingSSO from "./lib/index";
export default {
  name: "app",
  mounted() {
    // OAuth 授权码模式
    // window.auth = this.auth = new AuthingSSO({
    //   appId: "5f057c6b13b687030fc8bb5d",
    //   appType: "oauth",
    //   appDomain: "goood.authing.com",
    //   host: {
    //     oauth: "http://localhost:5510/graphql"
    //   },
    // });

    // OAuth implicit 模式
    window.auth = this.auth = new AuthingSSO({
      appId: "5e109c456ef04e3c9ca54d6b",
      appType: "oidc",
      appDomain: "hebut-dorm.authing.cn",
    });

    // OIDC - 授权码模式
    // window.auth = this.auth = new AuthingSSO({
    //   appId: "5ef82ab9cd7a6b682ba3c7fd",
    //   appType: "oidc",
    //   appDomain: "tracksession.authing.com",
    //   scope: "openid profile",
    //   host: {
    //     oauth: "http://localhost:5510/graphql"
    //   }
    // });

    // OIDC - implicit 模式
    //  window.auth = this.auth = new AuthingSSO({
    //   appId: "5ef82ab9cd7a6b682ba3c7fd",
    //   appType: "oidc",
    //   appDomain: "tracksession.authing.com",
    //   scope: "openid profile",
    //   responseType: 'implicit',
    //   host: {
    //     oauth: "http://localhost:5510/graphql"
    //   }
    // });

    // saml sp
    // this.auth = new AuthingSSO({
    //   appId: "5cefc1148e241e66339fd601",
    //   appType: "saml",
    //   appDomain: "sp1.localtest.com",
    //   nonce: 113,
    //   timestamp: Date.now(),
    //   dev: true
    // });
    // saml idp
    // this.auth = new AuthingSSO({
    //   appId: "5cefc0408e241ed5759fd600",
    //   appType: "saml",
    //   appDomain: "idp1.localtest.com",
    //   nonce: 113,
    //   timestamp: Date.now(),
    //   dev: true
    // });
    console.log(this.auth);
  },
  methods: {
    async handleTrackSession() {
      // let res = await this.auth.login()
      let res = await this.auth.trackSession();
      console.log(res);
    },
    async handleLogin() {
      this.auth.login();
    },
    handleWindowLogin() {
      this.auth.windowLogin();
    },
    async handleLogout() {
      let res = await this.auth.logout();
      alert(JSON.stringify(res));
      console.log(res);
    },
    register() {
      this.auth.register()
    }
  }
};
</script>

<style>
</style>
