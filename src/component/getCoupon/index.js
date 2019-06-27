import Taro from '@tarojs/taro'
import util from '../../utils/util.js'
import constant from '../../config/constant.js'

const getCouponModel = {
  data: {
    dialogGetCoupon: {
      show: false,
      auth_status: null,
      couponHome: {},
      coupons: [],
      loginUrl: '/vendingMachine/login/login'
    }
  },

  coupon_page_scope: '', //展示优惠券的页面类型
  coupon_page_id: 0, //展示优惠券的页面的id

  /**
   * 初始化优惠券数据
   * page_scope: 展示优惠券的页面类型
   * page_id: 展示优惠券的页面的id
   */
  initGetCoupon: function(page_scope, page_id = null) {
    this.coupon_page_id = page_id
    this.coupon_page_scope = page_scope
    this.initGetCouponLoginUrl()
    util.judgeTokenStatus(
      data => {
        this.getCouponHome(true)
      },
      () => {
        this.getCouponHome(false)
      }
    )
  },

  // 设置登录url
  initGetCouponLoginUrl: function() {
    let { dialogGetCoupon } = this.data

    const gotoUrl = encodeURIComponent(`${util.returnCurrentPageUrlWithArgs()}`)
    let loginUrl
    if (gotoUrl) {
      loginUrl = '/vendingMachine/login/login?gotoUrl=' + gotoUrl
    } else {
      const gotoUrlElse = encodeURIComponent('pages/index/index')
      loginUrl = '/vendingMachine/login/login?gotoUrl=' + gotoUrlElse
    }

    dialogGetCoupon.loginUrl = loginUrl
    this.setData({
      dialogGetCoupon
    })
  },

  // 获取领券活动的主活动
  getCouponHome: function(hasToken) {
    let _this = this
    let { dialogGetCoupon } = this.data

    let getCouponHome_url = `${constant.couponsHome}&scope=${this.coupon_page_scope}&params=${this.coupon_page_id}`

    util.requestLoginUrl({
      url: getCouponHome_url,
      method: 'GET',
      hasToken,
      hasAuth: false,
      success: function(res) {
        // console.log("res=", res);
        // 有活动，且无论有多少个活动，都只取第一个
        if (res.results.length > 0) {
          dialogGetCoupon.show = true
          console.log('有数据', res.results)
          _this.getCouponCoupons(res.results[0].ad_id)
          dialogGetCoupon.couponHome = res.results[0]

          //领取优惠券，只要用户登录，就会自动领券
          if (hasToken) {
            console.log('领取优惠券')
            _this.userCouponRedemption(res.results[0].ad_id)
          }
        } else {
          dialogGetCoupon.show = false
        }
        _this.setData({
          dialogGetCoupon
        })
      }
    })

    this.setData({
      user_hasToken: hasToken
    })
  },

  // 获取主活动下的领券活动
  getCouponCoupons: function(id) {
    let _this = this
    let { dialogGetCoupon } = this.data

    let getCouponCoupons_url = `${constant.couponsCoupons}&ad_id=${id}`

    util.requestLoginUrl({
      url: getCouponCoupons_url,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        console.log('优惠券=', res.results)
        dialogGetCoupon.coupons = res.results
        _this.setData({
          dialogGetCoupon
        })
      }
    })
  },

  // 领券
  userCouponRedemption: function(id) {
    let _that = this
    let user_phone = wx.globalData.userSimpleInfo.phone
    console.log('user_phone=', user_phone)
    let { dialogGetCoupon } = this.data
    util.requestLoginUrl({
      url: `${constant.couponsFetched}`,
      method: 'POST',
      hasToken: true,
      data: {
        ad_id: id,
        phone: user_phone
      },
      success: function(res) {
        // console.log('---->', res);
      }
    })
  },

  /**
   * 关闭弹框
   */
  handleCloseDialogGetCoupon: function() {
    let dialogGetCoupon = this.data.dialogGetCoupon
    dialogGetCoupon.show = false
    this.setData({
      dialogGetCoupon: dialogGetCoupon
    })
  },

  /**
   * 显示弹框
   */
  handleShowDialogGetCoupon: function() {
    let dialogGetCoupon = this.data.dialogGetCoupon
    dialogGetCoupon.show = true
    this.setData({
      dialogGetCoupon: dialogGetCoupon
    })
  },

  /**
   * 跳转相应页面
   */
  handleCouponUse: function(e) {
    const urlTo = e.currentTarget.dataset.url
    console.log('urlTo=', `--${urlTo}--`)
    let footerTabUrl = constant.footerTabUrl

    // 根据不同的链接使用不同的api
    if (urlTo) {
      if (footerTabUrl.indexOf(urlTo) != -1) {
        Taro.reLaunch({
          url: urlTo
        })
      } else {
        Taro.navigateTo({
          url: urlTo
        })
      }
    }
  }
}

export default getCouponModel
