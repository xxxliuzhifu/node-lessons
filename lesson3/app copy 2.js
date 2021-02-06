const Koa = require('koa')
const superagent = require('superagent')
const cheerio = require('cheerio')
const app = new Koa()

// 任务
// 当在浏览器中访问 http://localhost:3000/ 时，输出 CNode(https://cnodejs.org/ ) 社区首页的所有帖子标题和链接，以 json 的形式。
// [
//     {
//       "title": "【公告】发招聘帖的同学留意一下这里",
//       "href": "http://cnodejs.org/topic/541ed2d05e28155f24676a12"
//     },
//     {
//       "title": "发布一款 Sublime Text 下的 JavaScript 语法高亮插件",
//       "href": "http://cnodejs.org/topic/54207e2efffeb6de3d61f68f"
//     }
//   ]

// 挑战
// 访问 http://localhost:3000/ 时，输出包括主题的作者

app.use(async (ctx, next) => {
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  const data = await new Promise((res) => {
    superagent.get('https://cnodejs.org/').end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        ctx.body = 'net work error'
        //   return next(err)
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text)
      var items = []
      $('#topic_list .cell').each(function (idx, element) {
        var $element = $(element).find('.topic_title')
        var $user = $(element).find('.user_avatar')
        items.push({
          title: $element.attr('title'),
          href: $element.attr('href'),
          author: $user.attr('href').split('/')[2]
        })
      })
      res(items)
    })
  })
  ctx.body = JSON.stringify(data)
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
