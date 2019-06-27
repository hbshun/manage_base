import Taro from '@tarojs/taro'
import constant from '../../config/constant.js'

const footerProduct = {
  data: {
    footerProduct: {
      showMenu: false
    }
  },
  handleFooterProductShowMenu: function() {
    let data = this.data.footerProduct
    data.showMenu = !data.showMenu
    console.log(data)
    this.setData({
      footerProduct: data
    })
  },

  /**
   * 点击搜索
   */
  clickToSearchPage: function() {
    Taro.navigateTo({
      url: '/pages/searchPage/searchPage'
    })
  },

  /**
   * 点击首页
   */
  clickToIndexPage: function() {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 点击客服
   */
  clickToCallToService: function() {
    Taro.makePhoneCall({
      phoneNumber: constant.SERVICE_PHONE
    })
  },

  /**
   * 点击跳到个人中心
   */
  clickToUserCenter: function() {
    Taro.switchTab({
      url: '/pages/usercenter/index/index'
    })
  },

  /**
   * 点击去到专柜页面
   */
  clickToBrand: function() {
    const brandId = this.data.brandId
    console.log(brandId)
    Taro.navigateTo({
      url: '/pages/brand/detail/detail?id=' + brandId
    })
  },

  /**
   * 点击去到购物车
   */
  clickToCart: function() {
    Taro.switchTab({
      url: '/pages/cart/index/index'
    })
  },

  /**
   * 点击直接购买
   */
  clickToOrder: function() {}
}

export default footerProduct
