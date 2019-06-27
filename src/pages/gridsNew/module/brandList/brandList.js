import Taro from '@tarojs/taro'
import util from '../../../../utils/util.js'
import constant from '../../../../config/constant.js'

const brandList = {
  /**
   * 获得热门品牌信息
   */
  getHotBrandData: function(rowIndex) {
    const _this = this

    util.request({
      url: constant.getHotBrandData,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        _this.handleHotBrandData(res, rowIndex)
      }
    })
  },

  /**
   * 处理热门品牌信息数据
   */
  handleHotBrandData: function(res, rowIndex) {
    for (let i = 0; i < res.length; i++) {
      let obj = {}

      obj.brand = res[i].brand.name
      obj.id = res[i].brand.id
      obj.description = res[i].description
      obj.url = '/pages/brand/detail/detail?id=' + obj.id

      let processImage1 = res[i].brand.shop_image
      if (util.needPrecssImage(processImage1)) {
        processImage1 = processImage1 + constant.imageSuffix.hotBrand
      }
      obj.img = processImage1

      let processImage2 = res[i].brand.logo
      if (util.needPrecssImage(processImage2)) {
        processImage2 = processImage2 + constant.imageSuffix.squareXS
      }
      obj.brandImg = processImage2
      obj.for_GIO = this.get_brand_info_for_GIO(rowIndex, obj.id)
      this.saveItemData(obj, rowIndex)
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 跳转到品牌详情
   */
  brandRredirectToBrandDetail: function(e) {
    const index = e.currentTarget.dataset.index
    const url = this.data.gridsData[index].url
    const interval_var = e.touches[0].pageY + this.scroll_top
    this.post_info_to_GIO('other', index, interval_var)
    Taro.navigateTo({
      url: url
    })
  },

  /**
   * 获得需要发送给GIO的信息
   */
  get_brand_info_for_GIO: function(rowIndex, brand_id) {
    const row = this.data.gridsRows[rowIndex]
    let info = {
      flowName_var: row.flow_name,
      moduleType_var: row.nodeType
    }

    info.hrefType_var = 'BRAND_DETAIL'
    info.hrefContent_var = brand_id
    info.columnIndex_var = row.item.length
    info.rowIndex_var = rowIndex
    info.interval_var = ''

    return info
  }
}

export default brandList
