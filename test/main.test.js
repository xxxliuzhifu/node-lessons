const { fibonacci } = require('../lesson6/app')

// 任务
// 当 n === 0 时，返回 0；n === 1时，返回 1;
// n > 1 时，返回 fibonacci(n) === fibonacci(n-1) + fibonacci(n-2)，如 fibonacci(10) === 55;
// n 不可大于10，否则抛错，因为 Node.js 的计算性能没那么强。
// n 也不可小于 0，否则抛错，因为没意义。
// n 不为数字时，抛错。
describe('test/main.test.js', function () {
  it('should equal 0 when n === 0', function () {
    expect(fibonacci(0)).toBe(0)
  })
  it('should equal 1 when n === 1', function () {
    expect(fibonacci(0)).toBe(0)
  })
  it('should equal 55 when n === 10', function () {
    expect(fibonacci(10)).toBe(55)
  })
  it('should throw when n > 10', function () {
    expect(() => fibonacci(11)).toThrow('n should <= 10')
  })
  it('should throw when n < 0', function () {
    expect(() => fibonacci(-1)).toThrow('n should >= 0')
  })
  it('should throw when n isnt number', function () {
    expect(() => fibonacci('我的')).toThrow('n should be a number')
  })
})
