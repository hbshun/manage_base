import Taro from '@tarojs/taro'
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'

const product = {
  data: {},

  /**
   * 点击产品前的勾选按钮
   */
  productChooseStatus: function(e) {
    const id = e.currentTarget.dataset.id
    const prodChecked = !e.currentTarget.dataset.checked
    const data = {
      product_ids: '' + id,
      checked: prodChecked
    }

    this.chooseProduct(data)
  },

  /**
   * 点击加减产品
   */
  clickChangeQuantity: function(e) {
    const id = e.currentTarget.dataset.id
    let quantity = e.currentTarget.dataset.quantity
    const btnType = e.currentTarget.dataset.type

    if (btnType == 'sub') {
      if (!(quantity == 1)) {
        quantity--
      }
    } else {
      quantity++
    }

    const data = {
      product_id: id,
      quantity: quantity
    }

    this.controlProdQuantity(data)
  },

  /**
   * 向后台发送更改购物车product数量的请求
   */
  controlProdQuantity: function(data) {
    const that = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.cart,
      method: 'POST',
      data: data,
      success: function(res) {
        that.initialData(res)
        Taro.hideToast()
      }
    })
  },

  /**
   * 点击查看商品详情
   */
  cartLinkToProductInfo: function(e) {
    const id = e.currentTarget.dataset.id
    Taro.navigateTo({
      url: '/packageA/product/detail/detail?id=' + id
    })
  },

  /**
   * 修改活动
   */
  modifyPromotion: function(e) {
    const productIndex = e.currentTarget.dataset.productIndex
    const brandIndex = e.currentTarget.dataset.brandIndex
    const product = this.data.brandData[brandIndex].products[productIndex]

    let productInfo = {}
    productInfo.id = product.id
    productInfo.main_image = product.main_image
    productInfo.title = product.title
    productInfo.sku_attr = product.sku_attr

    let promotions = product.promotion_choice_to_dic.map(function(item) {
      item.promotionType = item.promotion_type.promotion_type
      item.promotionName = item.promotion_type.name
      return item
    })

    wx.globalData.productInfo = productInfo
    wx.globalData.promotions = promotions

    Taro.navigateTo({
      url: '../modifyPromotions/modifyPromotions'
    })
  },

  /**
   * 阻止冒泡（函数里不用写东西）
   */
  stopBubbling: function(e) {},

  /**
   * 滑动删除
   */
  deleteSoldOutProd: function(e) {
    const that = this
    const obj = {
      product_ids: e.currentTarget.dataset.id
    }

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.cart,
      method: 'PUT',
      data: obj,
      success: function(res) {
        that.initialData(res)
        Taro.showToast({
          icon: 'success',
          title: '删除成功'
        })
      }
    })
  }
}

export default product
