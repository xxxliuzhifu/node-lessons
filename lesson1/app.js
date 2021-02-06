const Koa = require('koa')
const app = new Koa()

// 任务
// 启动一个最简单的服务
app.use(async (ctx) => {
  ctx.body = 'hello world'
})

app.listen(3100, () => {
  console.log('http://localhost:3100')
})
