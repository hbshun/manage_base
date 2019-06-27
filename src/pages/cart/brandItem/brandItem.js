import Taro from '@tarojs/taro'
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import product from '../product/product.js'

const brandItem = {
  data: {},

  /**
   * 点击品牌前面的全选按钮
   */
  brandAllChooseStatus: function(e) {
    const brandIndex = e.currentTarget.dataset.brandIndex
    const brandData = this.data.brandData
    const brandChecked = !brandData[brandIndex].checked
    let productsStr = ''

    for (let i = 0; i < brandData[brandIndex].products.length; i++) {
      productsStr += brandData[brandIndex].products[i].id + ','
    }

    const obj = {
      product_ids: productsStr.substring(0, productsStr.length - 1),
      checked: brandChecked
    }

    this.chooseProduct(obj)
  },

  /**
   * 选择对购物车里的商品进行勾选
   */
  chooseProduct: function(data) {
    const that = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.chooseProduct,
      method: 'POST',
      data: data,
      success: function(res) {
        that.initialData(res)
        Taro.hideToast()
      }
    })
  },

  /**
   * 转到品牌页
   */
  turnToBrand: function(e) {
    const id = e.currentTarget.dataset.id
    Taro.navigateTo({
      url: '/pages/brand/detail/detail?id=' + id
    })
  },

  /**
   * 手指开始滑动
   */
  startMovableTouch: function(e) {
    let brandData = this.data.brandData

    for (let i = 0; i < brandData.length; i++) {
      for (let j = 0; j < brandData[i].products.length; j++) {
        brandData[i].products[j].x = 0
      }
    }

    this.setData({
      brandData
    })
  },

  /**
   * 手指结束触碰
   */
  movableTouchEnd: function(e) {
    console.log('结束触碰')
    const brandIndex = e.currentTarget.dataset.brandIndex
    const productIndex = e.currentTarget.dataset.productIndex
    // let brandData = this.data.brandData;

    let currentProduct = {}
    currentProduct.brandIndex = brandIndex
    currentProduct.productIndex = productIndex
    this.data.currentProduct = currentProduct
    // console.log('--------------------');
    // console.log(slideDelete.brandIndex);
    // console.log(brandIndex);
    // console.log(slideDelete.productIndex);
    // console.log(productIndex);
    // console.log(!(slideDelete.brandIndex == brandIndex && slideDelete.productIndex == productIndex));
    // if (!(slideDelete.brandIndex == brandIndex && slideDelete.productIndex == productIndex)) {
    //   // 如果点击了任何一个不是被打开的item的地方，那么设置slideDelete为空
    //   this.data.slideDelete = {};
    //   for (let i = 0; i < brandData.length; i++) {
    //     for (let j = 0; j < brandData[i].products.length; j++) {

    //       brandData[i].products[j].x = 0;
    //     }
    //   };
    //   this.setData({
    //     brandData,
    //   });
    // }
  },

  /**
   * movable左滑或者右滑
   */
  movableChange: function(e) {
    let brandData = this.data.brandData
    const brandIndex = e.currentTarget.dataset.brandIndex
    const productIndex = e.currentTarget.dataset.productIndex
    const currentX = e.detail.x
    let currentBrandIndex = this.data.currentProduct.brandIndex
    // let currentProductIndex = this.data.currentProduct.productIndex;
    // console.log(currentBrandIndex);
    if (currentBrandIndex !== undefined && currentBrandIndex != 9999) {
      // 还未设置过滑动打开的

      if (e.detail.source == '') {
        console.log('手动设置的x')
        this.data.currentProduct.brandIndex = 9999
      } else {
        console.log('source', e.detail.source)
        if (0 - currentX > 0.1) {
          console.log('大于0', currentX)
          console.log(
            this.data.currentProduct.brandIndex,
            this.data.currentProduct.productIndex
          )
          brandData[this.data.currentProduct.brandIndex].products[
            this.data.currentProduct.productIndex
          ].x = -4000
          // 避免重复设置打开
          this.data.currentProduct.brandIndex = 9999
        } else {
          console.log('小于0', currentX)
          console.log(
            this.data.currentProduct.brandIndex,
            this.data.currentProduct.productIndex
          )
          brandData[this.data.currentProduct.brandIndex].products[
            this.data.currentProduct.productIndex
          ].x = 0
          this.data.currentProduct.brandIndex = 9999
        }

        this.setData({
          brandData
        })
        console.log(brandData)
      }
    }
  }
}

export default brandItem
