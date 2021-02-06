const Koa = require('koa')
const superagent = require('superagent')
const cheerio = require('cheerio')
const url = require('url')
const cors = require('koa2-cors')

const cnodeUrl = 'https://cnodejs.org/'

const app = new Koa()

app.use(cors())

// 获取url
function getTopicUrls(text) {
  var topicUrls = []
  var $ = cheerio.load(text)
  // 获取首页所有的链接
  $('#topic_list .topic_title').each(function (idx, element) {
    var $element = $(element)
    var href = url.resolve(cnodeUrl, $element.attr('href'))
    topicUrls.push(href)
  })
  return topicUrls.slice(0, 5)
}

// 获取信息
function getAuthorInfo(item) {
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
  const author = $1('#content .panel .cell ').eq(0).find('.reply_author')
  return { title, firstPanel, author }
}

// 获取积分
async function getAuthorScore(authorUrl) {
  const res = await superagent.get(authorUrl)
  const $author = cheerio.load(res.text)
  const score = $author('#content .unstyled .big').eq(0).text().trim()
  return { score }
}

app.use(async (ctx, next) => {
  const data = await new Promise((resolve, reject) => {
    superagent.get(cnodeUrl).end(async function (err, res) {
      if (err) {
        return reject(err)
      }
      const topicUrls = getTopicUrls(res.text)
      const urlArray = topicUrls.map((item) => {
        return superagent.get(item)
      })
      let newArr = []
      for (let i = 0; i < urlArray.length; i += 3) {
        newArr.push(urlArray.slice(i, i + 3))
      }
      const ary = []
      for (let i = 0; i < newArr.length; i++) {
        const res1 = await Promise.all(newArr[i])
        for (let i = 0; i < res1.length; i++) {
          const { title, firstPanel, author } = getAuthorInfo(res1[i])
          try {
            const authorUrl = url.resolve(cnodeUrl, author.attr('href'))
            const { score } = await getAuthorScore(authorUrl)
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
      }
      resolve(ary)
    })
  }).catch((err) => {
    return 404
  })
  ctx.body = JSON.stringify(data)
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
