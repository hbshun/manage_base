import Taro from '@tarojs/taro'
// onlineOrders通用方法
const onlineOrderUtil = {
  /**
   * 根据 订单状态 和 售后状态 来判断左上角的文字内容
   */
  translateOrderStatusText: function(status, aftersale_status) {
    let statusText = ''
    switch (status) {
      case 'unpaid':
        // 待支付
        statusText = '待付款'
        break
      case 'to_ship':
        // 待发货
        statusText = '待发货'
        break
      case 'to_pickup':
        // 可提货
        statusText = '可自提'
        break
      case 'after_sale':
        // 售后
        statusText = '售后'
        break
      case 'completed':
        // 已完成
        statusText = '已完成'
        break
      case 'closed':
        // 已关闭/取消
        statusText = '已关闭/取消'
        break
    }
    // 售后订单需要再根据aftersale_status进行判断，优先显示售后信息
    switch (aftersale_status) {
      case 'open':
        // 售后进行中
        statusText = '售后进行中'
        break
      case 'done':
        // 已完成售后
        statusText = '已完成售后'
        break
    }
    return statusText
  },
  /**
   * 根据 售后状态 判断是否可开立发票
   * ，可开立发票的情况下跳转到发票开立页面
   */
  invoiceOnline: function(order_number, aftersale_status) {
    // 没有售后，跳转到开立发票页面
    if (aftersale_status === 'none') {
      Taro.navigateTo({
        url: `/pages/usercenter/invoiceOpening/index?order_number=${order_number}&type=online`
      })
      return
    }
    Taro.showModal({
      title: '提示',
      content: '本订单存在售后，请联系客服开立发票',
      showCancel: false,
      confirmText: '返回',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  }

  /**
   * 暴漏的接口
   */
}
module.exports = onlineOrderUtil
