const Koa = require('koa')
const superagent = require('superagent')
const cheerio = require('cheerio')
const url = require('url');

const cnodeUrl = 'https://cnodejs.org/';

const app = new Koa()

app.use(async (ctx) => {
    const data = await new Promise((resolve) => {
        superagent.get(cnodeUrl)
            .end(function (err, res) {
                if (err) {
                    return console.error(err);
                }
                var topicUrls = [];
                var $ = cheerio.load(res.text);
                // 获取首页所有的链接
                $('#topic_list .topic_title').each(function (idx, element) {
                    var $element = $(element);
                    // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
                    // 我们用 url.resolve 来自动推断出完整 url，变成
                    // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
                    // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
                    var href = url.resolve(cnodeUrl, $element.attr('href'));
                    topicUrls.push(href);
                })
                topicUrls = topicUrls.slice(0, 3);
                const urlArray = topicUrls.map((item) => {
                    return superagent.get(item)
                })
                Promise.all(urlArray).then((res) => {
                    const a = res.map((item, index) => {
                        const $1 = cheerio.load(item.text);
                        const b = $1('#content .topic_full_title:last').contents()
                            .filter(function () {
                                return this.nodeType === 3
                            })
                            .text()
                            .trim()
                        const firstPanel = $1('#content .panel .cell').eq(0).find('.markdown-text p').text().trim()
                        console.log('b', b)
                        return {
                            title: b,
                            href: topicUrls[index],
                            comment1: firstPanel
                        }
                    })
                    // console.log('res', res)
                    resolve(a)
                })
                // resolve(topicUrls)
                // console.log(topicUrls);
            });
    })
    ctx.body = JSON.stringify(data)
})

app.listen(3000, () => {
    console.log('http://localhost:3000')
})