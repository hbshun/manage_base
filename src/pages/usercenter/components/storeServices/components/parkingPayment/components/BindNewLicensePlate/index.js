import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/storeServices/components/parkingPayment/components/BindNewLicensePlate/index.js
import util from '../../../../../../../../utils/util.js'
import constant from '../../../../../../../../config/constant.js'
import LicensePlateInput from '../LicensePlateInput/index'
import ParkingLotInfo from '../ParkingLotInfo/index'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    province: '京',
    license_plate: '',
    account_id: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id
    })
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  provinceCodesChange = e => {
    console.log('省份为', e.detail.province)
    const license_plate = e.detail.province
    this.setData({
      province: e.detail.province
    })
  }
  licensePlateChange = e => {
    console.log('车牌号为', e.detail.license_plate)
    this.setData({
      license_plate: e.detail.license_plate
    })
  }
  bindLicensePlate = () => {
    const _this = this
    const { account_id, license_plate, province } = _this.data
    const now = util.formatTime(new Date())
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: constant.bindLicensePlate,
      method: 'POST',
      data: {
        accountid: account_id,
        unionid: '',
        platnumber: util.removeStringMark(
          province + license_plate.toUpperCase(),
          ' '
        ),
        binddate: now
      },
      success: function(res) {
        Taro.hideToast()
        console.log(res)
        if (res.success) {
          console.log('绑定成功', res)
          // 只绑定车牌，弹出提示信息，不跳转到停车信息页面
          Taro.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          })
          _this.goback()
        } else {
          util.showModalError(res.errmsg)
        }
      }
    })
  }
  goback = () => {
    Taro.navigateBack({
      delta: 1
    })
  }
  config = {}

  render() {
    return (
      <View className="parking-payment">
        <ParkingLotInfo title="绑定新车牌"></ParkingLotInfo>
        <View className="license-plate-card">
          <LicensePlateInput
            onProvinceCodesChange={this.provinceCodesChange}
            onLicensePlateChange={this.licensePlateChange}
          ></LicensePlateInput>
          <View className="query-button" onClick={this.bindLicensePlate}>
            绑定车牌
          </View>
          <View className="goback-button" onClick={this.goback}>
            返回
          </View>
        </View>
        <View className="tips">
          残障人士可预约停车服务，预约电话: 010-66018899
        </View>
      </View>
    )
  }
}

export default _C
