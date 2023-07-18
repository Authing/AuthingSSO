const path = require('path')
const Koa = require('koa')
const serve = require('koa-static')
const route = require('koa-route')

const app = new Koa()

const views = serve(path.join(__dirname + '/views'))

app.use(views)

app.use(route.get('/login/callback', ctx => {
  ctx.response.redirect(`/index.html`)
}))

app.use(route.get('/logout/callback', ctx => {
  ctx.response.redirect(`/index.html`)
}))

app.listen(3001)
