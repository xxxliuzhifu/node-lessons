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
    superagent.get(cnodeUrl).end(function (err, res) {
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
      topicUrls = topicUrls.slice(0, 10)
      const urlArray = topicUrls.map((item) => {
        return superagent.get(item)
      })
      const ary = []
      Promise.all(urlArray).then(async (res) => {
        for (let i = 0; i < res.length; i++) {
          const item = res[i]
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
          const author = $1('#content .panel .cell ')
            .eq(0)
            .find('.reply_author')
          try {
            const authorUrl = url.resolve(cnodeUrl, author.attr('href'))
            const res = await superagent.get(authorUrl)
            const $author = cheerio.load(res.text)
            const score = $author('#content .unstyled .big').eq(0).text().trim()
            ary.push({
              title: title,
              href: topicUrls[i],
              comment1: firstPanel,
              author: author.text(),
              score: score
            })
          } catch (error) {
            console.log('error', error)
          }
        }
        resolve(ary)
      })
    })
  }).catch((err) => {
    return 404
  })
  ctx.body = JSON.stringify(data)
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
