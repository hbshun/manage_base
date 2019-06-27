import Taro from '@tarojs/taro'
// pages/usercenter/storeServices/storeServices.js
const storeServicesConfig = {
  /**
   * 点击查看购物记录
   */
  redirectToShoppingRecord: function() {
    Taro.navigateTo({
      url: `/pages/usercenter/components/storeServices/components/shoppingRecord/index?account_id=${this.data.account_id}`
    })
  },
  /**
   * 点击查看停车缴费
   */
  redirectToParkingPayment: function() {
    // 跳转旧版小程序停车缴费
    Taro.navigateToMiniProgram({
      appId: 'wx26875c5baf27b8b0',
      path: '/pages/parking/index',
      extraData: {
        foo: 'bar'
      },
      envVersion: 'trial',
      success(res) {
        // 打开成功
      }
    })
    // wx.navigateTo({
    //   url: `/pages/usercenter/components/storeServices/components/parkingPayment/index?account_id=${this.data.account_id}`,
    // })
  },

  /**
   * 点击查看会员权益
   */
  redirectToUserEquity: function() {
    Taro.navigateTo({
      url:
        '/pages/usercenter/components/storeServices/components/userEquity/index?'
    })
  }
}

export default storeServicesConfig
