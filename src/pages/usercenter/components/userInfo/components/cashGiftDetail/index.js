import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/userInfo/components/cashGiftDetail/index.js
import util from '../../../../../../utils/util.js'
import constant from '../../../../../../config/constant.js'
import moment from '../../../../../../common/js/moment.js'
import DialogModel from '../../../../../../component/dialogModel/index'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    phone: '',
    account_id: '',
    points_data: {}
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      phone: options.phone,
      account_id: options.account_id
    })
    this.getPoint()
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  getPoint = () => {
    const _this = this
    let { phone } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.getPoint}?phone=${phone}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        const points_data = _this.formatPointsData(res.data)
        _this.setData({
          points_data
        })
      }
    })
  }
  formatPointsData = data => {
    let newData = {}
    newData.accountid = data.accountid
    newData.c_coupons = data.c_coupons
    newData.car_coupons_count = data.car_coupons_count
    newData.cardno = data.cardno
    newData.gift_coupons_count = data.gift_coupons_count
    newData.grade = data.grade
    newData.grademsg = data.grademsg
    newData.isgrade = data.isgrade
    newData.name = data.name
    newData.points = data.points
    newData.a_coupons_start_time = data.a_coupons
      ? moment(data.a_coupons.useStartTime).format('YYYY.MM.DD')
      : null
    newData.a_coupons_end_time = data.a_coupons
      ? moment(data.a_coupons.useEndTime).format('YYYY.MM.DD')
      : null
    newData.a_coupons_value = data.a_coupons ? data.a_coupons.balanceAmt : 0
    return newData
  }
  reLaunchToUserCenter = () => {
    Taro.navigateBack({
      delta: 1
    })
  }
  config = {
    enablePullDownRefresh: false
  }

  render() {
    const { points_data: points_data } = this.state
    return (
      <View className="page">
        <View className="title">汉光礼金明细</View>
        <View className="coupon-list">
          <View className="coupon-item">
            <View className="coupon-title">C券</View>
            <View className="coupon-value">
              {points_data.c_coupons + ' 元'}
            </View>
          </View>
        </View>
        <View className="coupon-list">
          <View className="coupon-item">
            <View className="coupon-title">A券</View>
            <View className="coupon-value">
              {points_data.a_coupons_value + ' 元'}
            </View>
          </View>
          {points_data.a_coupons_value > 0 && (
            <View className="coupon-tips">
              <View>
                {'有效期：' +
                  points_data.a_coupons_start_time +
                  ' - ' +
                  points_data.a_coupons_end_time}
              </View>
              <View>仅限百货区使用，特例商品除外，详见店内明示</View>
            </View>
          )}
        </View>
        <View className="button" onClick={this.reLaunchToUserCenter}>
          返回
        </View>
      </View>
    )
  }
}

export default _C
