import Taro from '@tarojs/taro'
import util from '../../utils/util.js'
import constant from '../../config/constant.js'

const promotionInfo = {
  data: {},

  /**
   * 点击查看活动详情
   */
  turnToInfo: function(e) {
    this.setData({
      showPromInfo: true
    })

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    const id = e.currentTarget.dataset.id
    const that = this
    util.request({
      url: constant.getPromotionInfo + id,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        that.handlePromInfo(res)
      },
      fail: function(err) {
        console.log(err)
      }
    })
  },

  /**
   * 处理活动详情
   */
  handlePromInfo: function(data) {
    this.data.endTime = data.end_time

    this.endTimecountDown()

    let promotionLevel = [] //整理成一定格式的arr
    const promType = data.promotion_type.promotion_type

    switch (promType) {
      case 'GIFT':
        // http://backend5.dongyouliang.com/api/sparrow_promotions/show_promotionmains/9/
        for (let i = 0; i < data.promotions.length; i++) {
          // 活动level
          let obj = {}

          obj.promType = promType
          obj.typeName = data.promotion_type.name
          obj.levelDesc = data.promotions[i].description
          obj.gift = []
          for (let j = 0; j < data.promotions[i].gifts.length; j++) {
            let giftObj = {}
            const gift = data.promotions[i].gifts[j]

            giftObj.image = gift.image
            giftObj.price = gift.price
            giftObj.description = gift.description
            obj.gift.push(giftObj)
          }

          promotionLevel.push(obj)
        }
        break

      case 'FIXED_PRICE':
        // http://backend5.dongyouliang.com/api/sparrow_promotions/show_promotionmains/11/
        for (let i = 0; i < data.promotions.length; i++) {
          // 活动level
          let obj = {}

          obj.promType = promType
          obj.typeName = data.promotion_type.name
          obj.levelDesc = data.promotions[i].description
          obj.gift = []
          for (
            let j = 0;
            j < data.promotions[i].fixed_price_products.length;
            j++
          ) {
            let giftObj = {}
            const gift = data.promotions[i].fixed_price_products[j]

            giftObj.image = gift.main_image
            giftObj.price = data.promotions[i].b_fixed_amount
            giftObj.original_price = gift.original_price
            giftObj.description =
              gift.title + ' ' + gift.sub_title + ' ' + gift.sku_attr
            obj.gift.push(giftObj)
          }

          promotionLevel.push(obj)
        }
        break

      case 'COUPON':
        // http://backend5.dongyouliang.com/api/sparrow_promotions/show_promotionmains/12/
        for (let i = 0; i < data.promotions.length; i++) {
          // 活动level
          let obj = {}

          obj.promType = promType
          obj.typeName = data.promotion_type.name
          obj.levelDesc = data.promotions[i].description
          obj.gift = []
          for (let j = 0; j < data.promotions[i].coupons.length; j++) {
            let giftObj = {}
            const gift = data.promotions[i].coupons[j]

            giftObj.price = gift.discount_amount
            giftObj.image = gift.image
            giftObj.description = gift.description
            for (let k = 0; k < data.promotions[i].coupons[j].quantity; k++) {
              //把quantity数量的coupons平铺显示
              obj.gift.push(giftObj)
            }
          }
          promotionLevel.push(obj)
        }
        break

      default:
        for (let i = 0; i < data.promotions.length; i++) {
          // 活动level
          let obj = {}

          obj.promType = promType
          obj.typeName = data.promotion_type.name
          obj.levelDesc = data.promotions[i].description
          promotionLevel.push(obj)
        }
    }

    this.setData({
      promotionLevel,
      note: data.promotion_type.notes
    })

    Taro.hideToast()
  },

  /**
   * 倒计时定时器
   */
  endTimecountDown: function() {
    const _this = this
    this.data.timer = setInterval(() => {
      let endTime = _this.data.endTime

      const otherInfo = _this.orderClosedTime(endTime)
      _this.setData({
        otherInfo
      })
      console.log('hahha')
    }, 500)
  },

  /**
   * 计算订单还有多长时间到期
   */
  orderClosedTime: function(endDate) {
    let otherInfo = {}
    const nowTime = new Date()
    const endDate_ = new Date(endDate + 'Z') // 后台返回的时间是中国区时间,一般newDate后单位会变成中国区时间,但是如果在小程序中单位会变成格林威治时间，为了消除差异，把返回时间强制变成格林威治时间（单位改变，但是数值不变），格林威治时间比中国时间要晚8小时

    const timeDifferent = new Date().getTimezoneOffset() // 当地时间与的格林威治时间差，单位：分

    const endTime = endDate_.getTime() + timeDifferent * 60 * 1000 // 转成当地时间

    const twoDay = 172800000 // 2天

    if (endTime - nowTime.getTime() > twoDay) {
      // 大于2天只显示天数
      const remainDay = Math.floor((endTime - nowTime.getTime()) / 86400000)
      otherInfo.days = remainDay
    } else if (endTime - nowTime.getTime() < 0) {
      clearInterval(this.data.timer)
      otherInfo.text = '活动已结束'
    } else {
      const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000)
      const hour = this.formatNumber(Math.floor(differenceTime / 3600))
      const remainderMinute = differenceTime % 3600
      const minute = this.formatNumber(Math.floor(remainderMinute / 60))
      const remainderSecond = remainderMinute % 60
      const second = this.formatNumber(remainderSecond)

      otherInfo.hours = hour
      otherInfo.minutes = minute
      otherInfo.seconds = second
      // return `剩余：${hour}小时${minute}分钟${second}秒`;
    }

    return otherInfo
  },

  /**
   * 数位补全
   */
  formatNumber: function(n) {
    n = n.toString()
    if (n == 0) {
      return 0
    } else {
      return n[1] ? n : '0' + n
    }
  },

  /**
   * 关闭定时器
   */
  closeTimer: function() {
    clearInterval(this.data.timer)
  },

  /**
   * 关闭活动详情
   */
  closePromotionInfo: function(e) {
    this.closeTimer()
    this.setData({
      showPromInfo: false
    })
  }
}

export default promotionInfo
