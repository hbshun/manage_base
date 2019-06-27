import Taro from '@tarojs/taro'
/**
 * 返回带gotoUrl参数的登录地址(gotoUrl是登录完成之后跳到的地址)
 */
export const returnLoginUrlWithGotoUrl = function() {
  // 获得调用api的当前页面的url作为gotoUrl，如果拿不到就把个人中心url作为gotoUrl
  const gotoUrl = encodeURIComponent(`${returnCurrentPageUrlWithArgs()}`)
  let loginUrl = ''

  if (gotoUrl) {
    loginUrl = '/vendingMachine/login/login?gotoUrl=' + gotoUrl
  } else {
    const gotoUrlElse = encodeURIComponent('/pages/usercenter/index/index')
    loginUrl = '/vendingMachine/login/login?gotoUrl=' + gotoUrlElse
  }
  return loginUrl
}

/**
 * 获取当前页和参数并返回拼接好的url
 */
export const returnCurrentPageUrlWithArgs = function() {
  var pages = Taro.getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  var url = currentPage.route //当前页面url
  var options = currentPage.options //如果要获取url中所带的参数可以查看options
  // console.log(pages);
  //拼接url的参数
  var urlWithArgs = url + '?'
  for (var key in options) {
    var value = options[key]
    urlWithArgs += key + '=' + value + '&'
  }
  urlWithArgs = '/' + urlWithArgs.substring(0, urlWithArgs.length - 1)

  return urlWithArgs
}

/**
 * 获得当前页面的参数options
 */
export const return_current_page_options = function() {
  const pages = Taro.getCurrentPages() //获取加载的页面
  const currentPage = pages[pages.length - 1] //获取当前页面的对象
  const options = currentPage.options //如果要获取url中所带的参数可以查看options
  let new_options = {}

  for (key in options) {
    new_options[key] = options[key]
  }

  return new_options
}

/**
 * 根据传入的路径和options对象返回url
 */
export const return_url_with_options = function(url, options = {}) {
  let new_url = ''

  if (url.indexOf('?') > -1) {
    new_url = `${url}&`
  } else {
    new_url = `${url}?`
  }

  for (var key in options) {
    var value = options[key]
    new_url += key + '=' + value + '&'
  }

  new_url = new_url.substring(0, new_url.length - 1)

  return new_url
}

/**
 * 根据当前url(带参)和传入的options对象返回url
 */
export const return_current_url_with_options = function(options) {
  const current_url = returnCurrentPageUrlWithArgs()
  const new_url = return_url_with_options(current_url, options)

  return new_url
}
