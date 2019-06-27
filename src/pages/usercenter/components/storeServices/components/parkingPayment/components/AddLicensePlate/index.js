import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    account_id: ''
  }
  _observeProps = []
  state = {}
  bindNewLicensePlate = () => {
    Taro.navigateTo({
      url: `/pages/usercenter/components/storeServices/components/parkingPayment/components/BindNewLicensePlate/index?account_id=${this.properties.account_id}`
    })
  }
  config = {
    component: true
  }

  render() {
    const { account_id: account_id } = this.props
    return (
      <View className="license-plate-card" onClick={this.bindNewLicensePlate}>
        <View className="icon">
          <View className="grid-icon sparrow-icon icon-add"></View>
        </View>
        <View className="add-button">绑定新车牌</View>
      </View>
    )
  }
} // pages/usercenter/components/storeServices/components/parkingPayment/components/AddLicensePlate/index.js

export default _C
