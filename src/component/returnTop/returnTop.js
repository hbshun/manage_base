import Taro from '@tarojs/taro'
const returnTop = {
  data: {
    showReturnTop: false, // 控制是否显示回到顶部
    screenHeight: 1000 // 设备的高度
  },

  /**
   * 获得屏幕高度
   */
  getScreenHeight: function() {
    const _this = this
    Taro.getSystemInfo({
      success: function(res) {
        _this.setData({
          screenHeight: res.windowHeight
        })
      }
    })
  },

  /**
   * 判断是否显示返回顶部
   */
  judgeAndShowReturnTop(e) {
    const _this = this
    const screenHeight = this.data.screenHeight
    let showReturnTop = false
    // 一定要记得在页面上的滚动标签上添加id=product-detail-top
    // 在页面中记得先调用this.getScreenHeight获得屏幕高度
    Taro.createSelectorQuery()
      .select('#product-detail-top')
      .boundingClientRect(function(rect) {
        if (e.scrollTop > screenHeight) {
          showReturnTop = true
        }

        _this.setData({
          showReturnTop
        })
      })
      .exec()
  },

  /**
   * 点击回到顶部
   */
  returnTop: function() {
    Taro.pageScrollTo({
      scrollTop: 0
    })
  }
}

export default returnTop
