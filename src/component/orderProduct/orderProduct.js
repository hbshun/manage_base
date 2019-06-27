import Taro from '@tarojs/taro'
const orderProduct = {
  /**
   * 商品和加价购的物品点击进入商品详情页
   */
  clickToProductDetail: function(e) {
    const id = e.currentTarget.dataset.productGiftId
    if (id) {
      Taro.navigateTo({
        url: '/packageA/product/detail/detail?id=' + id
      })
    }
  }
}

export default orderProduct
