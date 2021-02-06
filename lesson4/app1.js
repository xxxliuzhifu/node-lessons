const Koa = require('koa')
const superagent = require('superagent')
const cheerio = require('cheerio')
const url = require('url')
const cors = require('koa2-cors')

const cnodeUrl = 'https://cnodejs.org/'

const app = new Koa()

app.use(cors())

app.use(async (ctx, next) => {
  const data = await new Promise((resolve, reject) => {
    superagent.get(cnodeUrl).end(async function (err, res) {
      if (err) {
        return reject(err)
      }
      var topicUrls = []
      var $ = cheerio.load(res.text)
      // 获取首页所有的链接
      $('#topic_list .topic_title').each(function (idx, element) {
        var $element = $(element)
        // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
        // 我们用 url.resolve 来自动推断出完整 url，变成
        // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
        // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
        var href = url.resolve(cnodeUrl, $element.attr('href'))
        topicUrls.push(href)
      })
      topicUrls = topicUrls.slice(0, 3)
      let a = []
      for (let i = 0; i < topicUrls.length; i++) {
        const item = await superagent.get(topicUrls[i])
        const $1 = cheerio.load(item.text)
        const title = $1('#content .topic_full_title:last')
          .contents()
          .filter(function () {
            return this.nodeType === 3
          })
          .text()
          .trim()
        const firstPanel = $1('#content .panel .cell')
          .eq(0)
          .find('.markdown-text p')
          .text()
          .trim()
        a.push({
          title: title,
          href: topicUrls[i],
          comment1: firstPanel
        })
      }
      resolve(a)
    })
  }).catch((err) => {
    return 404
  })
  ctx.body = JSON.stringify(data)
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
