import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    license_info: ''
  }
  _observeProps = []
  state = {}
  enquiryPayment = () => {
    // detail对象，提供给事件监听函数
    const myEventDetail = {
      license_plate: this.properties.license_info
      // 触发事件的选项
    }
    const myEventOption = {}
    this.triggerEvent('enquiryPayment', myEventDetail, myEventOption)
  }
  untyingLicensePlate = () => {
    // detail对象，提供给事件监听函数
    const myEventDetail = {
      license_plate: this.properties.license_info
      // 触发事件的选项
    }
    const myEventOption = {}
    this.triggerEvent('untyingLicensePlate', myEventDetail, myEventOption)
  }
  config = {
    component: true
  }

  render() {
    const { license_info: license_info } = this.props
    const {} = this.state
    return (
      <View className="license-plate-card">
        <View className="license-plate-value" onClick={this.enquiryPayment}>
          {license_info}
        </View>
        <View className="delete-button" onClick={this.untyingLicensePlate}>
          解绑
        </View>
      </View>
    )
  }
} // pages/usercenter/components/storeServices/components/parkingPayment/components/LicensePlateCard/index.js

export default _C
