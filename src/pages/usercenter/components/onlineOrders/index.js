import Taro from '@tarojs/taro'
// pages/usercenter/onlineOrders/index.js
const onlineOrdersConfig = {
  /**
   * 点击查看全部订单
   */
  redirectToAllOnlineOrders: function() {
    Taro.navigateTo({
      url:
        '/pages/usercenter/components/onlineOrders/components/orderList/index?type=all'
    })
  },
  /**
   * 点击查看待付款订单
   */
  redirectToUnpaidOrders: function() {
    Taro.navigateTo({
      url:
        '/pages/usercenter/components/onlineOrders/components/orderList/index?type=unpaid'
    })
  },
  /**
   * 点击查看待发货订单
   */
  redirectToInitOrders: function() {
    Taro.navigateTo({
      url:
        '/pages/usercenter/components/onlineOrders/components/orderList/index?type=init'
    })
  },
  /**
   * 点击查看可自提订单
   */
  redirectToToDeliverOrders: function() {
    Taro.navigateTo({
      url:
        '/pages/usercenter/components/onlineOrders/components/orderList/index?type=to_pickup'
    })
  }
}

export default onlineOrdersConfig
