import { Block, View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/storeServices/components/parkingPayment/index.js
import util from '../../../../../../utils/util.js'
import constant from '../../../../../../config/constant.js'
import LicensePlateInput from './components/LicensePlateInput/index'
import ParkingLotInfo from './components/ParkingLotInfo/index'
import AddLicensePlate from './components/AddLicensePlate/index'
import LicensePlateCard from './components/LicensePlateCard/index'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    service_phone: constant.SERVICE_PHONE,
    consultation_phone: constant.CONSULATION_PHONE,
    account_id: '',
    license_plate: '',
    license_plate_list: [],
    province: '京',
    license_plate_list_length: 0
  }
  componentWillMount = (options = this.$router.params || {}) => {
    console.log(options)
    this.setData({
      account_id: options.account_id
    })
    this.getLicensePlateList()
  }
  componentDidMount = () => {}
  componentDidShow = () => {
    this.getLicensePlateList()
  }
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {
    this.setData({
      license_plate: '',
      license_plate_list: []
    })
    this.getLicensePlateList()
    Taro.stopPullDownRefresh()
  }
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  provinceCodesChange = e => {
    const license_plate = e.detail.province
    this.setData({
      province: e.detail.province
    })
  }
  licensePlateChange = e => {
    this.setData({
      license_plate: e.detail.license_plate
    })
  }
  getLicensePlateList = () => {
    const _this = this
    const { account_id, license_plate_list } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.getLicensePlateList}?accountid=${account_id}`,
      success: function(res) {
        Taro.hideToast()
        console.log(res)
        let license_plate_list = _this.formateData(res.data)
        _this.setData({
          license_plate_list
        })
      }
    })
  }
  formateData = data => {
    const _this = this
    let newdata = []
    data.map((item, index) => {
      if (index < 3) {
        newdata.push(item.platnumber)
      } else {
        return
      }
    })
    _this.setData({
      license_plate_list_length: newdata.length
    })
    return newdata
  }
  bindAndEnquiryPayment = () => {
    const _this = this
    let {
      province,
      license_plate,
      license_plate_list,
      license_plate_list_length
    } = _this.data
    // 车牌号
    let platnumber = util.removeStringMark(
      province + license_plate.toUpperCase(),
      ' '
    )
    if (!util.isLicensePlate(platnumber)) {
      util.showModalError('请输入正确的车牌号')
      return
    }
    if (license_plate_list_length > 2) {
      const onlyUnBind = false
      _this.unBindLicensePlate(
        license_plate_list[license_plate_list_length - 1],
        onlyUnBind
      )
      _this.bindLicensePlate(platnumber)
      return
    }
    _this.bindLicensePlate(platnumber)
  }
  directPayment = () => {
    const _this = this
    let { province, license_plate } = _this.data
    // 车牌号
    let platnumber = util.removeStringMark(
      province + license_plate.toUpperCase(),
      ' '
    )
    if (!util.isLicensePlate(platnumber)) {
      util.showModalError('请输入正确的车牌号')
      return
    }
    _this.redirectToParkingInfo(platnumber, 0)
  }
  enquiryPayment = e => {
    console.log('需要查询缴费信息的车牌号为', e.detail.license_plate)
    const { account_id } = this.data
    const license_plate = e.detail.license_plate
    this.redirectToParkingInfo(license_plate, account_id)
  }
  redirectToParkingInfo = (license_plate, account_id) => {
    Taro.navigateTo({
      url: `/pages/usercenter/components/storeServices/components/parkingPayment/components/ParkingInfo/index?license_plate=${license_plate}&account_id=${account_id}`
    })
  }
  bindLicensePlate = platnumber => {
    const _this = this
    const { account_id } = _this.data
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
        platnumber: platnumber,
        binddate: now
      },
      success: function(res) {
        Taro.hideToast()
        console.log(res)
        if (res.success) {
          console.log('绑定成功', res)
          // 绑定车牌并缴费，不弹出提示信息，跳转到停车信息页面查看停车缴费信息
          _this.redirectToParkingInfo(platnumber, account_id)
        } else {
          util.showModalError(res.errmsg)
        }
      }
    })
  }
  untyingLicensePlate = e => {
    console.log('需要解绑的车牌号', e.detail.license_plate)
    const license_plate = e.detail.license_plate
    const _this = this
    const { account_id } = _this.data
    const now = util.formatTime(new Date())
    Taro.showModal({
      title: '提示',
      content: `确定解绑车牌 " ${license_plate} " 吗？`,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          const onlyUnBind = true
          _this.unBindLicensePlate(license_plate, onlyUnBind)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
  unBindLicensePlate = (license_plate, onlyUnBind) => {
    const _this = this
    const { account_id } = _this.data
    util.request({
      url: constant.untyingLicensePlate,
      method: 'POST',
      data: {
        accountid: account_id,
        platnumber: license_plate
      },
      success: function(res) {
        console.log(res)
        if (res.success) {
          if (onlyUnBind) {
            Taro.showToast({
              title: '解绑成功',
              icon: 'success',
              duration: 2000
            })
          }
          console.log('解绑成功', res)
          _this.getLicensePlateList()
        } else {
          util.showModalError(res.errmsg)
        }
      }
    })
  }
  config = {
    navigationBarTitleText: '停车缴费'
  }

  render() {
    const {
      license_plate_list: license_plate_list,
      license_plate_list_length: license_plate_list_length,
      account_id: account_id
    } = this.state
    return (
      <View className="parking-payment">
        <ParkingLotInfo title="汉光百货停车场"></ParkingLotInfo>
        <View className="license-plate-card">
          <LicensePlateInput
            onProvinceCodesChange={this.provinceCodesChange}
            onLicensePlateChange={this.licensePlateChange}
          ></LicensePlateInput>
          <View className="query-button" onClick={this.bindAndEnquiryPayment}>
            绑定车牌并缴费
          </View>
          <View className="direct-payment">
            <Text onClick={this.directPayment}>不绑定 直接缴费</Text>
          </View>
        </View>
        <View className="tips">------ 绑定的车牌 (最多3个) ------</View>
        {license_plate_list.map((item, index) => {
          return (
            <View className="license-list">
              {0 <= license_plate_list_length && (
                <Block>
                  {license_plate_list.map((item, index) => {
                    return (
                      <View
                        key={'license-plate-card-' + index}
                        className="license-card"
                      >
                        <LicensePlateCard
                          licenseInfo={item}
                          onUntyingLicensePlate={this.untyingLicensePlate}
                          onEnquiryPayment={this.enquiryPayment}
                        ></LicensePlateCard>
                      </View>
                    )
                  })}
                </Block>
              )}
              {license_plate_list_length < 3 && (
                <View className="license-card">
                  <AddLicensePlate accountId={account_id}></AddLicensePlate>
                </View>
              )}
            </View>
          )
        })}
        <View className="tips">
          残障人士可预约停车服务，预约电话: 010-66018899
        </View>
      </View>
    )
  }
}

export default _C
