import Taro from '@tarojs/taro'
import util from '../../../../utils/util.js'
import constant from '../../../../config/constant.js'

const chooseDiscounts = {
  data: {
    pointShow: false,
    couponShow: false
  },

  /**
   * 点击灰色地方关闭弹层
   */
  closeChooseDiscounts: function() {
    const show = this.data.show

    show.chooseDiscounts = false
    show.textareaDisabled = false

    this.setData({
      show
    })
  },

  /**
   * 礼金抵扣动态更改
   */
  useACoupon: function(e) {
    const coupons = this.data.showCoupons
    let value

    if (e.detail.value) {
      value = parseInt(e.detail.value)
    } else {
      value = 0
    }

    if (value >= coupons.a_coupon.all) {
      coupons.a_coupon.used_amount = coupons.a_coupon.all
    } else {
      coupons.a_coupon.used_amount = parseInt(value)
    }

    this.setData({
      showCoupons: coupons
    })
  },

  /**
   * 积分抵扣动态更改
   */
  usePoint: function(e) {
    const coupons = this.data.showCoupons
    let value

    if (e.detail.value) {
      value = parseInt(e.detail.value)
    } else {
      value = 0
    }

    if (value >= coupons.c_coupon.all) {
      coupons.c_coupon.used_amount = coupons.c_coupon.all
    } else {
      coupons.c_coupon.used_amount = parseInt(value)
    }
    // coupons.discounts = coupons.pointsMoney + coupons.selected_a_coupon + coupons.selected_coupons.value;
    this.setData({
      showCoupons: coupons
    })
  },

  /**
   * 点击选择优惠券
   */
  chooseCoupon: function(e) {
    const coupons = this.data.showCoupons
    const couponIndex = e.currentTarget.dataset.index
    coupons.coupons[couponIndex].checked = !coupons.coupons[couponIndex].checked

    this.setData({
      showCoupons: coupons
    })
  },

  /**
   * 点击选择优惠券里的确定
   */
  clickConfirmDiscount: function() {
    console.log('click')
    let data = {}
    let couponsArr = []
    const coupons = this.data.showCoupons
    const that = this

    if (coupons.a_coupon) {
      data.a_coupon = coupons.a_coupon.used_amount
    }

    if (coupons.c_coupon) {
      data.points = coupons.c_coupon.used_amount
    }

    if (coupons.coupons) {
      data.coupon_codes = ''

      coupons.coupons.forEach(value => {
        if (value.checked == true) {
          couponsArr.push(value.code)
        }
      })
      data.coupon_codes = couponsArr.join(',')
    }

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.loadAllCoupons,
      method: 'POST',
      data: data,
      success: function(data) {
        that.closeChooseDiscounts()
        // that.handleOrderInfo(data);
        // wx.hideToast();
        that.getOrderInfo()
      }
    })
  },

  /**
   * 积分input聚焦
   */
  pointFocus: function() {
    this.setData({
      pointShow: true
    })
  },

  /**
   * 礼金input聚焦
   */
  couponFocus: function() {
    this.setData({
      couponShow: true
    })
  },

  /**
   * 积分input失焦
   */
  pointBlur: function() {
    this.setData({
      pointShow: false
    })
  },

  /**
   * 礼金input失焦
   */
  couponBlur: function() {
    this.setData({
      couponShow: false
    })
  }
}

export default chooseDiscounts
