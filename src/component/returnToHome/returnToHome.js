import Taro from '@tarojs/taro'

const returnToHome = {
  data: {
    showReturnToHome: false // 控制是否显示回到首页
  },

  /**
   * 判断是否显示返回顶部
   */
  judgeAndShowReturnToHome(e) {
    if (e.from_share) {
      this.setData({
        showReturnToHome: true
      })
    } else {
      this.setData({
        showReturnToHome: false
      })
    }
  },

  /**
   * 传进来的参数加上一个参数，这个参数表示会出现返回首页小按钮
   */
  getCurrentPageParameterToShare(options = {}) {
    let new_options = {}

    for (var key in options) {
      new_options[key] = options[key]
    }

    new_options.from_share = 1

    return new_options
  },

  /**
   * 点击回到首页
   */
  returnToHome: function() {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }
}

export default returnToHome
