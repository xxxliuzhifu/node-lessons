const Koa = require('koa')
const md5 = require('md5')
const sha1 = require('sha1')

const app = new Koa()

// 任务
// 当在浏览器中访问 http://localhost:3000/?q=alsotang 时，输出 alsotang 的 md5 值，即 bdd5e57b5c0040f9dc23d430846e68a3。

// 挑战
// 访问 http://localhost:3000/?q=alsotang 时，输出 alsotang 的 sha1 值，即 e3c766d71667567e18f77869c65cd62f6a1b9ab9。

app.use((ctx) => {
  const { q } = ctx.request.query
  //   ctx.body = md5(q || '')
  ctx.body = sha1(q || '')
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
