import Taro from '@tarojs/taro'
/**
 * util
 */
import qs from './qs/index.js'
import user from './user/index.js'
import {
  request,
  showModalMsg,
  showModalError,
  showModalConfirm
} from './weixin.js'
import regx from './regx.js'
import { search } from './search.js'
import constant from '../config/constant.js'
import {
  returnLoginUrlWithGotoUrl,
  returnCurrentPageUrlWithArgs,
  return_url_with_options,
  return_current_url_with_options,
  return_current_page_options
} from './returnUrl.js'

import wxbarcode from '../common/js/wxbarcode/index.js'
import WxQrcode from '../common/js/wxqrcode.js'

/**
 * 设置请求头
 */
function setRequestToken(obj) {
  const header = obj.header || Object.create(null)
  header['Cache-Control'] = 'no-cache'
  // hasToken === true
  if (obj.hasToken) {
    // 获取用户信息，设置请求头的 token
    const userInfo = user.getUserInfo()
    if (userInfo) {
      header.Authorization = 'Token ' + userInfo.accessToken
    }
  }
  obj.header = header
  return obj
}

const util = {
  // user
  user,
  showModalMsg,
  showModalError,
  showModalConfirm,
  returnLoginUrlWithGotoUrl,
  returnCurrentPageUrlWithArgs,
  return_url_with_options,
  return_current_url_with_options,
  return_current_page_options,

  /**
   * wx.request
   * 之后会都统一到request里
   */
  requestLoginUrl(obj) {
    this.request(obj)
  },
  /**
   * wx.request
   * 自动验证登录状态，如果登录失效，自动重新登录后重新发起request请求
   * @param hasToken bollean 请求头是否包含 token，默认true，包含。新加参数
   *
   */
  request: function(obj) {
    // console.log('----> loginStatus: ', wx.loginStatus);
    // 是否在头部传递 token ，默认为true
    if (obj.hasToken == null || obj.hasToken === '') {
      obj.hasToken = true
    }
    // 不要求登录，但是得传token的时候
    if (obj.hasAuth == null || obj.hasAuth === '') {
      obj.hasAuth = true
    }
    /**
     * Determine whether the user is logged in
     */
    const userInfo = user.getUserInfo()
    // 用户已登录，所有请求正常进行
    if (userInfo) {
      obj = setRequestToken(obj)
      request(obj, () => {
        /** 登录超时，执行此回调函数 */
        loginTimeout()
      })
    }
    // 用户未登录时
    else {
      loginTimeout()
    }

    function loginTimeout() {
      // 不需要token或者不需要登录的请求正常进行
      if (!obj.hasToken || !obj.hasAuth) {
        obj = setRequestToken(obj)
        request(obj)
      }
      // 需要登录的接口挂起到全局变量，登陆后再发起请求
      else {
        // 全局变量，存储需要登录的请求的状态，当请求完成 completed 时，发起请求
        wx.requestArr.push(obj)
        // 全局变量，存储登录状态，默认 completed 请求完成，loading 请求中，此时不允许发起新请求
        if (wx.requestArr.length > 0 && wx.loginStatus !== 'loading') {
          // 设置请求状态
          wx.loginStatus = 'loading'
          // 未登陆时，自动登录
          user.login(() => {
            // 执行在登录过程中挂起的请求
            wx.requestArr.forEach(item => {
              const requestObj = setRequestToken(item)
              request(requestObj)
            })
          })
        }
      }
    }
  },

  /**
   * 格式化时间输出，精确到秒
   */
  formatTime: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return (
      [year, month, day].map(this.formatNumber).join('-') +
      ' ' +
      [hour, minute, second].map(this.formatNumber).join(':')
    )
  },

  /**
   * 格式化时间输出,精确到天
   */
  formatTimeToDay: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(this.formatNumber).join('-')
  },

  /**
   * 格式化后台的时间字符串
   */
  formatTimeString: function(str) {
    return str.split('.')[0].replace('T', ' ')
  },

  /**
   * 数位补全
   */
  formatNumber: function(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  /**
   * 合并对象
   */
  assignObject: function() {
    const len = arguments.length
    let obj
    let objArr = []
    let dataArr = []
    for (let i = 0; i < len; i++) {
      obj = arguments[i]
      objArr.push(obj)
      if (obj.data != null) {
        dataArr.push(obj.data)
      }
    }
    let tmpObj = Object.assign({}, ...objArr)
    let tmpData = Object.assign({}, ...dataArr)
    tmpObj.data = tmpData
    return tmpObj
  },

  /**
   * 是否为空
   */
  isEmpty: function(value) {
    if (value == null) {
      return true
    }
    if (value === '') {
      return true
    }
    return false
  },

  /**
   * 验证是否为手机号
   */
  isPhone: function(phone) {
    return regx.phone.test(phone)
  },

  /**
   * 验证是否为正整数
   */
  isPositiveInteger: function(num) {
    return regx.positiveInteger.test(num)
  },

  /**
   * 点击支付
   */
  payOrder: function(order_id, url, func, obj) {
    // if (func) {
    //   func(obj);
    // }
    // 如果没有填写地址 默认跳到全部订单列表页面
    let gotoUrl =
      url ||
      '/pages/usercenter/components/onlineOrders/components/orderList/index'
    const _this = this

    this.request({
      url: constant.postOrder,
      data: {
        order_id
      },
      method: 'POST',
      success: function(data) {
        if (data.code == 0) {
          let config = data.result
          config.timeStamp += ''
          config.success = function(data) {
            if (func) {
              func(obj)
            }
            Taro.redirectTo({
              url: gotoUrl
            })
          }
          config.fail = function(err) {
            if (err.errMsg === 'requestPayment:fail cancel') {
              Taro.showModal({
                title: '提示',
                content: '您取消了支付',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    _this.goToPage(gotoUrl)
                  }
                }
              })
              Taro.hideToast()
            } else {
              showModalError('支付失败，请重试')
              Taro.hideToast()
            }
          }
          Taro.requestPayment(config)
        } else if (data.code == 1) {
          // 完全用C券支付
          Taro.redirectTo({
            url: gotoUrl
          })
        } else if (data.code == -1400) {
          //拿不到用户open_id无法支付，需要跳转登录页
          const gotoUrl = returnLoginUrlWithGotoUrl()
          Taro.redirectTo({
            url: gotoUrl
          })
        } else {
          showModalError(data.message)
        }
      }
    })
  },

  /**
   * 点击进入页面
   */
  goToPage: function(url) {
    Taro.redirectTo({
      url: url
    })
  },

  /**
   * 小程序支付
   */
  wxappPayment: function(data, orderId, link) {
    link =
      link ||
      '/pages/usercenter/components/onlineOrders/components/orderDetail/index'
    let that = this
    const url = `${link}?id=${orderId}`
    if (data.code === 0) {
      let config = data.result
      config.timeStamp += ''
      config.success = function(data) {
        // console.log('---success', data);
        Taro.redirectTo({
          url
        })
      }
      config.fail = function(err) {
        Taro.redirectTo({
          url
        })
      }
      Taro.requestPayment(config)
    } else {
      showModalError(data.message)
    }
  },

  /**
   * 搜索
   */
  search: search,

  /**
   * 获取营业分类
   */
  getCategories: function(categories) {
    const categoryArr = []
    categories.forEach((category, idx) => {
      if (category.parent_id) {
        categoryArr.push(category.name)
      }
    })
    return categoryArr.join(' ')
  },

  log: function(obj) {
    Taro.request(obj)
  },

  /**
   * 返回是否需要处理图片
   */
  needPrecssImage: function(imageUrl) {
    let flag = false
    if (imageUrl) {
      const condition1 = imageUrl.indexOf('dongyouliang') > -1
      const condition2 = imageUrl.indexOf('hanguangbaihuo') > -1
      if (condition1 || condition2) {
        flag = true
      }
    }
    return flag
  },

  /**
   * 打印日志
   */
  printLog: function(source, action, content) {
    let header = {}
    header['Cache-Control'] = 'no-cache'
    let postData = {}
    postData.source = source
    postData.action = action
    postData.content = content
    postData.anonymous_id = wx.globalData.userSimpleInfo.virtualOpenId
    postData.user = wx.globalData.userSimpleInfo.phone
    postData.share_param = wx.globalData.userSimpleInfo.share_param
    postData.wechat_app_id = wx.globalData.userSimpleInfo.wechat_app_id
    if (postData.anonymous_id == '') {
      // 说明还没有取anonymous_id的api还没返回，等3秒后再获取，如果3秒后还获取不到，就直接打印
      setTimeout(() => {
        postData.anonymous_id = wx.globalData.userSimpleInfo.virtualOpenId
        postData.user = wx.globalData.userSimpleInfo.phone
        postData.share_param = wx.globalData.userSimpleInfo.share_param
        postData.wechat_app_id = wx.globalData.userSimpleInfo.wechat_app_id
        Taro.request({
          header: header,
          url: constant.printLog,
          method: 'POST',
          data: postData,
          success: function(res) {}
        })
      }, 2000)
    } else {
      Taro.request({
        header: header,
        url: constant.printLog,
        method: 'POST',
        data: postData,
        success: function(res) {}
      })
    }
  },

  /**
   * 获取扫普通链接二维码打开小程序的参数
   */
  getOptionsByQRCode(qStr) {
    const link = decodeURIComponent(qStr)
    const linkArr = link.split('?')
    const params = qs.parse(linkArr[1])
    return params
  },

  /**
   * 获取当前页url
   */
  getCurrentPageUrl() {
    var pages = Taro.getCurrentPages() //获取加载的页面
    var currentPage = pages[pages.length - 1] //获取当前页面的对象
    var url = currentPage.route //当前页面url
    return url
  },

  /**
   * 获取url参数拼成字符串
   */
  returnUrl: function(options) {
    delete options.jump_type
    let str = ''
    for (let i in options) {
      str += i + '=' + options[i] + '&'
    }
    if (str) {
      str = str.slice(0, str.length - 1)
      str = '?' + str
    }
    return str
  },

  /**
   * 判断token的状态，看看token是否有效
   */
  judgeTokenStatus(success, fail) {
    let _this = this
    let header = {
      'content-type': 'application/json'
    }
    // 获取用户信息，设置请求头的 token
    const userInfo = user.getUserInfo()
    // 当用户信息（token）存在时，判断token是否有效
    if (userInfo) {
      header.Authorization = 'Token ' + userInfo.accessToken
      const requestTask = Taro.request({
        url: constant.tokenVerification,
        header,
        success(res) {
          // token有效时
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // console.log('token有效');
            success && success(res.data)
          }
          // token 无效时，尝试静默登录
          else if (res.statusCode === 401) {
            // console.log('token过期');
            _this.slientLogin(success, fail, res)
          }
          // 错误信息
          else {
            showModalError(res.errMsg)
          }
        }
      })
    }
    // token不存在时，尝试静默登录
    else {
      // console.log('token不存在');
      this.slientLogin(success, fail, null) ////////////////////////////////////注释：新用户和点击退出的用户也是新用户
    }
  },

  // 静默登录函数
  slientLogin(success, fail, data) {
    // 尝试静默登录
    user.expertLogin(
      () => {
        // console.log('静默登录成功');
        // 静默登录成功，调用成功回调函数
        success && success(data)
      },
      () => {
        // console.log('静默登录失败');
        // 静默登录失败，调用失败回调函数
        fail && fail(data)
      }
    )
  },

  /**
   * 发送formId给后台
   */
  postFormId: function(formId, formType) {
    const data = {
      form_id: formId,
      from_type: formType
    }
    util.request({
      url: constant.postFormId,
      method: 'POST',
      data: data,
      success: function(res) {
        console.log('成功发送formId到模板消息')
      },
      fail: function(err) {
        // console.log(err);
      }
    })
  },

  // 强制刷新页面，清除数据缓存
  clearUserCache: function(username) {
    util.request({
      url: constant.clearUserCache,
      method: 'POST',
      data: {
        username: username
      },
      success: function(res) {
        console.log('清除缓存成')
      },
      fail: function(err) {
        console.log(err)
      }
    })
  },

  /**
   * 判断会员等级
   * MEMBER_L0:普卡会员
   * MEMBER_L1:银卡会员
   * MEMBER_L2:金卡会员
   */
  determineMembershipLevel: function(level) {
    if (level === 'MEMBER_L0') {
      return '普卡会员'
    } else if (level === 'MEMBER_L1') {
      return '银卡会员'
    } else if (level === 'MEMBER_L2') {
      return '金卡会员'
    }
  },

  /**
   * 将用户积分兑换为礼金
   * 100积分兑换1元礼金
   */
  convertingPointsIntoGifts: function(points) {
    return parseInt(points / 100)
  },

  /**
   * 格式化优惠券有效时间
   * 精确到日
   */
  formateCouponVaildTime: function(str) {
    // 通过 prototype 为 JavaScript 的 String 对象添加方法，来实现将所有 "-" 替换为 "."
    String.prototype.replaceAll = function(search, replacement) {
      var target = this
      return target.replace(new RegExp(search, 'g'), replacement)
    }
    return str.slice(0, str.indexOf('T')).replaceAll('-', '.')
  },

  /**
   * 截取指定位置的字符串
   * str:要截取的字符串
   * start:开始位置（包含）
   * end:结束位置（不包含）
   */
  substring: function(str, start, end) {
    return str.slice(start, end)
  },

  /**
   * 除去字符串中符号
   */
  removeStringMark: function(str, mark) {
    // 通过 prototype 为 JavaScript 的 String 对象添加方法，来实现将所有 " " 替换为 ""
    String.prototype.replaceAll = function(search, replacement) {
      var target = this
      return target.replace(new RegExp(search, 'g'), replacement)
    }
    return str.replaceAll(mark, '')
  },

  /**
   * 除去小数点
   */
  removeDecimalPoints: function(str) {
    return Math.floor(str)
  },

  /**
   * 返回字符串中从mark到结尾的子串
   */
  returnEndSubstr: function(str, mark) {
    return str.substring(str.indexOf(mark) + 1, str.length)
  },
  /**
   * 返回字符串中从开头到mark的子串
   */
  returnStartSubstr: function(str, mark) {
    return str.substring(0, str.indexOf(mark))
  },

  /**
   * 解析字符串，返回字符串中最后一个/后面的内容
   */
  returnUrlSubstr: function(str) {
    return str.substring(str.lastIndexOf('/') + 1, str.length)
  },

  /**
   * 生成条形码
   */
  createBarcode: function(id, code, width, height) {
    wxbarcode.barcode(id, code, width, height)
  },

  /**
   * 生成二维码
   */
  createQrcode: function(id, code, width, height) {
    wxbarcode.qrcode(id, code, width, height)
  },

  /**
   * 生成二维码
   */
  createWxQrcode: function(code, size) {
    return WxQrcode.createQrCodeImg(code, size)
  },

  // 正则验证车牌,验证通过返回true,不通过返回false
  isLicensePlate: function(str) {
    // 1、传统车牌
    // 第1位为省份简称（汉字），第二位为发牌机关代号（A - Z的字母）第3到第7位为序号（由字母或数字组成，但不存在字母I和O，防止和数字1、0混淆，另外最后一位可能是“挂学警港澳使领”中的一个汉字）。
    // 2、新能源车牌
    // 第1位和第2位与传统车牌一致，第3到第8位为序号（比传统车牌多一位）。新能源车牌的序号规则如下：
    // 小型车：第1位只能是字母D或F，第2为可以是数字或字母，第3到6位必须是数字。
    // 大型车：第1位到第5位必须是数字，第6位只能是字母D或F。

    // return (/^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/.test(str));
    str = this.removeStringMark(str, ' ')
    console.log('str', str)
    return /^[\u4e00-\u9fa5_a-zA-Z0-9]{7,8}$/.test(str)
  }
}

/**
 * 暴漏的接口
 */
module.exports = util
