import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/storeServices/components/parkingPayment/components/ParkingLotInfo/index.js
import constant from '../../../../../../../../config/constant.js'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    title: '汉光百货停车场',
    charging_standard: '2.5元/15分钟'
  }
  _observeProps = []
  state = {
    consultation_phone: constant.CONSULATION_PHONE
  }
  config = {
    component: true
  }

  render() {
    const { title: title, charging_standard: charging_standard } = this.props
    const { consultation_phone: consultation_phone } = this.state
    return (
      <View className="parking-lot-info">
        <View className="parking-lot-title">{title}</View>
        <View className="parking-lot-value">
          <View>{'收费标准：' + charging_standard}</View>
          <View>位置信息：汉光百货B2，共100个停车位</View>
          <View>{'咨询电话： ' + consultation_phone}</View>
        </View>
      </View>
    )
  }
}

export default _C
