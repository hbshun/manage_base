import Taro from '@tarojs/taro'

const GIO_utils = {
  /**
   * 设置分享参数
   */
  return_url_parameter: function(url, options) {
    let options_str = ''
    let new_url = ''

    for (let i in options) {
      options_str += '&' + i + '=' + options[i]
    }

    if (url.indexOf('?') > -1) {
      new_url = url + options_str
    } else {
      options_str = options_str.slice(1)
      new_url = url + '?' + options_str
    }

    return new_url
  },

  /**
   * 根据订单状态选择发送给GIO的订单类型
   */
  return_order_type: function(order_type) {
    let type_name = '其他订单类型'
    switch (order_type) {
      case 'line':
        type_name = '线上订单'
        break

      case 'online':
        type_name = '线上订单'
        break

      case 'flashsale':
        type_name = '闪购订单'
        break
    }

    return type_name
  },

  /**
   * 发送订单数据给GIO
   */
  send_GIO_after_pay_success: function(obj) {
    const { productInfoForGIO, orderInfoForGIO, productEvent, orderEvent } = obj
    sendProductInfoToGIO()
    sendOrderInfoToGIO()

    /**
     * 发商品数据给GIO
     */
    function sendProductInfoToGIO() {
      productInfoForGIO.forEach(product => {
        GIO_utils.send_track_function(productEvent, product)
      })
    }

    /**
     * 发送给订单数据给GIO
     */
    function sendOrderInfoToGIO() {
      GIO_utils.send_track_function(orderEvent, orderInfoForGIO)
    }
  },

  /**
   * 有关联事件级变量
   */
  send_track_function: function(event, obj) {
    wx.globalData.gio('track', event, obj)
  },

  /**
   * 设置转化变量
   */
  send_setEvar_function: function(obj) {
    wx.globalData.gio('setEvar', obj)
  },

  /**
   * 设置页面级变量
   */
  send_setPage_function: function(obj) {
    wx.globalData.gio(obj)
  },

  /**
   * 设置登录用户变量
   */
  set_login_user_info_GIO: function() {
    let userId = ''
    // 拿登录后的userId
    Taro.getStorage({
      key: 'key_user',
      success: function(res) {
        if (res.data) {
          userId = res.data.userId
          wx.globalData.gio('setUserId', userId)
        }
      }
    })

    // 拿微信昵称、微信头像、性别、微信所填国家、微信所填省份、微信所填城市
    Taro.getUserInfo({
      success: function(res) {
        wx.globalData.gio('setVisitor', res.userInfo)
      }
    })
  }
}

export default GIO_utils
