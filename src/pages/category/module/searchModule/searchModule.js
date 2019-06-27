import Taro from '@tarojs/taro'
// pages/category/module/searchModule/searchModule.js
const searchData = {
  /**
   * 页面的初始数据
   */
  data: {
    shopShow: true, // 列表显示
    inputShowed: false, // 搜索栏
    inputVal: '' // 搜索栏上填写的数据
  },

  onReady: function() {},

  showInput: function() {
    // this.setData({
    //   inputShowed: true
    // });
    Taro.navigateTo({
      url: '/pages/searchPage/searchPage'
    })
  }
}

export default searchData
