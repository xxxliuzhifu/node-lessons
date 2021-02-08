// 任务
var web_development = 'python php ruby javascript jsonp perhapsphpisoutdated'
// var web_development = 'jsonp'
// 找出其中 包含 p 但不包含 ph 的所有单词，即
// [ 'python', 'javascript', 'jsonp' ]
const reg1 = /p/
const reg2 = /ph/
const arr = web_development.split(' ')
arr.forEach((item) => {
  if (reg1.test(item) && !reg2.test(item)) {
    console.log(item)
  }
})
