/**
 * 浮点计算
 * * ** explame **
 *  0.1 + 0.2 == 0.30000000000000004 （多了 0.00000000000004）
 *  0.2 + 0.4 == 0.6000000000000001  （多了 0.0000000000001）
 *  19.9 * 100 == 1989.9999999999998 （少了 0.0000000000002）
 *
 * 注：
 * JS 中能精准表示的最大整数是 Math.pow(2, 53)，十进制即 9007199254740992。
 * 转化后的整数不能超过这个数字
 */

/**
 * 判断是否为数字
 */
function isNumber(str) {
  // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
  if (str === '' || str == null) {
    return false
  }
  if (!isNaN(str)) {
    return true
  }
  return false
}

/**
 * 判断传入的值是否是一个整数
 */
function isInteger(num) {
  return Math.floor(num) === num
}

/**
 * 获取浮点小数位数
 */
function getDecimalDigits(floatNum) {
  const strFloat = floatNum + ''
  const dotPosition = strFloat.indexOf('.')
  const dotLen = strFloat.substr(dotPosition + 1).length
  return dotLen || 0
}

/**
 * 将一个浮点数转成一个整数，返回整数和倍数。
 * 例：3.14 >> 整数 314，倍数 100
 *
 * @param {number} floatNum  小数
 * @return {object}
 *   {times: 100, num: 314}
 */
function toInteger(floatNum) {
  if (!isNumber(floatNum)) {
    // throw new Error('输入的不是数字');
    console.error(`你输入的值 ${floatNum} 不是数字`)
  }
  let result = {
    times: 1,
    num: 0
  }
  const isNegative = floatNum < 0
  // 整数情况
  if (isInteger(floatNum)) {
    result.num = floatNum
    return result
  }

  // 小数情况
  const dotLen = getDecimalDigits(floatNum)
  const times = Math.pow(10, dotLen)
  // +0.5 确保能够取得正确的整数部分
  let intNumber = parseInt(Math.abs(floatNum) * times + 0.5, 10)
  if (isNegative) {
    intNumber = -intNumber
  }
  result.times = times
  result.num = intNumber
  return result
}

/**
 * 加法
 * @param {floatNum} a
 * @param {floatNum} b
 * @return {floatNum} 返回的小数位数为传入的最大小数位数
 */
function add(a, b) {
  const obj1 = toInteger(a)
  const obj2 = toInteger(b)
  const n1 = obj1.num
  const n2 = obj2.num
  const t1 = obj1.times
  const t2 = obj2.times
  const max = t1 > t2 ? t1 : t2
  let result = null

  // 小数位数相同
  if (t1 === t2) {
    result = n1 + n2
  }
  // a 小数位大于 b
  else if (t1 > t2) {
    result = n1 + n2 * (t1 / t2)
  }
  // a 小数位小于 b
  else {
    result = n1 * (t2 / t1) + n2
  }
  return result / max
}

/**
 * 减法
 * @param {floatNum} a
 * @param {floatNum} b
 * @return {floatNum} 返回的小数位数为传入的最大小数位数
 */
function subtract(a, b) {
  const obj1 = toInteger(a)
  const obj2 = toInteger(b)
  const n1 = obj1.num
  const n2 = obj2.num
  const t1 = obj1.times
  const t2 = obj2.times
  const max = t1 > t2 ? t1 : t2
  let result = null

  // 小数位数相同
  if (t1 === t2) {
    result = n1 - n2
  }
  // a 小数位大于 b
  else if (t1 > t2) {
    result = n1 - n2 * (t1 / t2)
  }
  // a 小数位小于 b
  else {
    result = n1 * (t2 / t1) - n2
  }
  return result / max
}

/**
 * 乘法
 * @param {floatNum} a
 * @param {floatNum} b
 * @return {floatNum}
 */
function multiply(a, b) {
  const obj1 = toInteger(a)
  const obj2 = toInteger(b)
  const n1 = obj1.num
  const n2 = obj2.num
  const t1 = obj1.times
  const t2 = obj2.times

  return (n1 * n2) / (t1 * t2)
}

/**
 * 除法
 * @param {floatNum} a
 * @param {floatNum} b
 * @return {floatNum}
 */
function divide(a, b) {
  const obj1 = toInteger(a)
  const obj2 = toInteger(b)
  const n1 = obj1.num
  const n2 = obj2.num
  const t1 = obj1.times
  const t2 = obj2.times

  return (n1 / n2) * (t2 / t1)
}

/**
 * toFixed 修复 四舍五入
 * @param {number} num
 * @param {*} digits
 */
function toFixed(num, digits) {
  var times = Math.pow(10, digits)
  var des = num * times + 0.5
  return parseInt(des, 10) / times
}

/**
 * 强制保留 n 位小数，如：2，会在2后面补上00.即2.00
 */
function toDecimal(x, num) {
  num = num || 2
  var s = x.toString()
  var rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + num) {
    s += '0'
  }
  return s
}

const floatObj = {
  add,
  subtract,
  multiply,
  divide,
  toFixed,
  toDecimal
}

export default floatObj
