import Taro from '@tarojs/taro'
import constant from '../../../../config/constant.js'
import util from '../../../../utils/util.js'

const chooseExpress = {
  data: {},

  /**
   * 选择配送方式
   */
  chooseExpress: function(e) {
    console.log(e)
    const shippingType = e.currentTarget.dataset.shippingType
    const that = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.loadExpress,
      data: {
        shipping_type: shippingType
      },
      method: 'POST',
      success: function(data) {
        that.handleOrderInfo(data)
        Taro.hideToast()
      }
    })
  },

  /**
   * 关闭弹层
   */
  closeChooseExpress: function() {
    let show = this.data.show

    show.chooseExpress = false
    show.textareaDisabled = false

    this.setData({
      show
    })
  }
}

export default chooseExpress
