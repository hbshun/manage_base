import util from '../../../../utils/util.js'
import constant from '../../../../config/constant.js'

const activeDetail = {
  data: {},

  /**
   * 点击查看活动详情
   */
  turnToInfo: function(promotions) {
    const _this = this
    this.setData({
      showPromInfo: true
    })

    let all_promotion = []
    console.log(promotions)
    const promotion_name = promotions.promotion_name
    for (let i = 0; i < promotion_name.length; i++) {
      promotions.promotion_info.map(item => {
        if (item.promotion_type.name === promotion_name[i]) {
          // console.log(item);
          all_promotion.push(_this.handlePromInfo(item))
        }
      })
    }

    this.setData({
      all_promotion
    })
  },

  /**
   * 处理活动详情
   */
  handlePromInfo: function(data) {
    let otherInfo = this.formatRemainTime(data.end_time)
    let old_note = data.promotion_type.note
    let note = ''
    if (old_note) {
      note = data.promotion_type.note.split('*')
    }

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

    return {
      promotionLevel,
      note: note,
      endTime: otherInfo
    }
  },

  /**
   * 计算活动剩余时间
   */
  formatRemainTime: function(timeData) {
    return timeData.replace(
      /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/g,
      '$1年$2月$3日 $4时$5分'
    )
  },

  /**
   * 关闭活动详情
   */
  closePromotionInfo: function(e) {
    this.setData({
      showPromInfo: false
    })
  }
}

export default activeDetail
