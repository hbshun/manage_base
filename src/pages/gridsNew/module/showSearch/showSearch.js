import Taro from '@tarojs/taro'
/**
 * 搜索栏
 */
const searchModule = {
  data: {
    shopShow: true, // 列表显示
    inputShowed: false, // 搜索栏
    inputVal: '', // 搜索栏上填写的数据
    search_big_div: {
      background: 'rgba(255,255,255,0)', // rgba(255,255,255,0) -> rgba(255,255,255,1)
      padding: '206rpx' // 206rpx -> 60rpx
    },
    search_bar_form: {
      color: 'rgb(255, 255, 255)', // rgb(255, 255, 255) -> rgb(69, 69, 69)
      background: 'rgba(0, 0, 0, 0.3)' // rgba(0, 0, 0, 0.3) -> rgba(238, 238, 238, 1)
    }
  },

  showInput: function() {
    // this.setData({
    //   inputShowed: true
    // });
    Taro.navigateTo({
      url: url
    })
  },

  /**
   * 根据页面滚动改变搜索框的样式
   */
  scrollPage(search_big_div, search_bar_form) {
    this.setData({
      search_big_div,
      search_bar_form
    })
  }
}

export default searchModule
