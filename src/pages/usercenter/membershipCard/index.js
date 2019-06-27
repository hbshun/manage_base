import { Block, View, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/userInfo/components/membershipCard/index.js
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    cardID: '' // 会员卡号
  }
  constantData = {
    member_code: null,
    screenBrightness: null,
    timerID: null // 计时器
  }
  componentWillMount = (options = this.$router.params || {}) => {
    // 获取到会员卡号
    this.setData({
      cardID: options.cardID
    })
  }
  componentDidMount = () => {
    this.getMemberCode()
    this.getScreenBrightness()
    this.barcodeRefreshTimer()
  }
  componentWillUnmount = () => {
    // 清除计时器
    this.clearIimer()
    // 恢复屏幕亮度
    this.setScreenBrightness(this.constantData.screenBrightness)
  }
  onPullDownRefresh = () => {
    // 清除计时器
    this.clearIimer()
    // 获取用户标识
    this.getMemberCode()
    // 停止下拉刷新
    Taro.stopPullDownRefresh()
    // 开启计时器，定时刷新
    this.barcodeRefreshTimer()
  }
  reLaunchToUserCenter = () => {
    Taro.navigateBack({
      delta: 1
    })
  }
  barcodeRefreshTimer = () => {
    const _this = this
    _this.constantData.timerID = setInterval(() => {
      _this.getMemberCode()
    }, 60000)
  }
  clearIimer = () => {
    clearInterval(this.constantData.timerID)
    this.constantData.timerID = null
  }
  getMemberCode = () => {
    const _this = this
    Taro.showLoading({
      title: 'loading...',
      mask: true
    })

    util.request({
      url: constant.getMemberCode,
      method: 'GET',
      success: function(res) {
        const member_code = res.member_code
        setTimeout(() => {
          util.createBarcode('barcode', member_code, 620, 150)
        }, 300)
      },
      complete() {
        Taro.hideLoading()
      }
    })
  }
  setScreenBrightness = value => {
    Taro.setScreenBrightness({
      value: value,
      success: function(res) {},
      fail: function(res) {}
    })
  }
  getScreenBrightness = () => {
    const _this = this
    Taro.getScreenBrightness({
      success: function(res) {
        //记录下来初始亮度
        _this.constantData.screenBrightness = res.value

        // 将屏幕调到最亮
        _this.setScreenBrightness(1)
      },
      fail: function(res) {}
    })
  }
  config = {
    navigationBarTitleText: '汉光会员卡',
    backgroundColor: '#2f3238',
    enablePullDownRefresh: true,
    navigationBarBackgroundColor: '#2f3238',
    navigationBarTextStyle: 'white'
  }

  render() {
    const { cardID: cardID } = this.state
    return (
      <View className="page" onClick={this.reLaunchToUserCenter}>
        <View className="big-barcode">
          <View className="color-bar"></View>
          <Canvas canvasId="barcode"></Canvas>
          <View className="barnum">{cardID}</View>
        </View>
        <View className="tips">
          会员码定时更新，请勿截屏，以免影响正常使用!
        </View>
        <View className="grid-icon sparrow-icon icon-close icon"></View>
      </View>
    )
  }
}

export default _C
