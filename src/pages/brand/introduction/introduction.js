import Taro from '@tarojs/taro'
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
/**
 * 获取品牌相关信息
 */
let brandInfo = {
  data: {
    mainBrand: {} //品牌相关信息
  },

  /**
   * 获取品牌信息
   */
  getBrandInfo: function(id) {
    const _this = this
    // 获取品牌相关信息
    util.request({
      url: `${constant.brandDetailAndActive}${id}/`,
      method: 'GET',
      hasToken: false,
      success: function(brandData) {
        let mainBrand = _this.formatBrandData(brandData)
        _this.setData({
          mainBrand
        })
      }
    })
  },
  /**
   * 展示品牌详情
   */
  formatBrandData: function(brandInfo) {
    const _this = this
    let mainBrand = {}
    mainBrand.id = brandInfo.id
    mainBrand.imgArr = _this.initSwiperImages(brandInfo.shop.images)
    mainBrand.name = brandInfo.name
    mainBrand.location = brandInfo.shop.floor
      ? brandInfo.shop.floor.name + ' ' + brandInfo.shop.location
      : '暂无'
    mainBrand.phone = brandInfo.shop.contact
    mainBrand.product_quantity = brandInfo.product_quantity
    mainBrand.categoriy = util.getCategories(brandInfo.categories)

    // 品牌logo
    let processImage = brandInfo.logo
    if (util.needPrecssImage(processImage)) {
      processImage = processImage + constant.imageSuffix.squareXS
    }
    mainBrand.logo = processImage

    // 品牌活动
    mainBrand.activity = _this.getBrandPromotions(brandInfo.promotionmains)

    return mainBrand
  },

  /**
   * 处理品牌图片
   */
  initSwiperImages: function(arr) {
    // 品牌未配置图片的情况下，使用默认图片
    if (arr.length <= 0) {
      arr.push(constant.brandDefaultImage)
    }

    let imageArr = arr.map(value => {
      let processImage = value
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.brandFocus
      }

      return processImage
    })

    return imageArr
  },

  //获取活动的相关数据
  getBrandPromotions: function(arr) {
    let activity = {}
    let all_promotion_name = []
    arr.map(item => {
      let promotion_name = item.promotion_type.name
      if (
        promotion_name !== '包邮' &&
        all_promotion_name.indexOf(promotion_name) === -1
      ) {
        all_promotion_name.push(promotion_name)
      }
    })
    // 获取品牌下的所有活动的名称
    activity.promotion_name = all_promotion_name
    // 获取品牌下的所有活动信息
    activity.promotion_info = arr
    return activity
  },

  /**
   * 联系专柜
   */

  contactCounter: function(e) {
    Taro.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },

  /**
   * 预览图片
   */

  previewImages: function(e) {
    // console.log("res=", e);
    Taro.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接
      urls: e.target.dataset.images // 需要预览的图片http链接列表
    })
  }
}

export default brandInfo
