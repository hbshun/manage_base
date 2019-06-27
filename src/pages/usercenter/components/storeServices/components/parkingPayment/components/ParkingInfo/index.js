import { Block, View, ScrollView, Text, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/storeServices/components/parkingPayment/components/ParkingInfo/index.js
import util from '../../../../../../../../utils/util.js'
import constant from '../../../../../../../../config/constant.js'
import moment from '../../../../../../../../common/js/moment.js'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    payment_info: {},
    account_id: '',
    license_plate: '',
    deduction_parking_fee: true,
    pay_parking_fees: 0
  }
  timer = null
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id,
      license_plate: options.license_plate
    })
    this.getParkingInfo(options.license_plate, options.account_id)
  }
  componentDidMount = () => {}
  componentDidShow = () => {
    const { license_plate, account_id } = this.data
    this.timer = setInterval(() => {
      this.getParkingInfo(license_plate, account_id)
      // this.payFaildModal('查询超时，请返回停车缴费首页重新查询缴费')
    }, 60000)
  }
  componentDidHide = () => {
    clearInterval(this.timer)
    this.timer = null
  }
  componentWillUnmount = () => {
    clearInterval(this.timer)
    this.timer = null
  }
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  getParkingInfo = (license_plate, account_id) => {
    const _this = this
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: constant.getParkingInfo,
      method: 'POST',
      data: {
        car_plate: license_plate,
        account_id: account_id
      },
      success: function(res) {
        Taro.hideToast()
        console.log(res)
        _this.setData({
          payment_info: _this.formatePaymentInfo(res)
        })
        console.log('payment_info', _this.formatePaymentInfo(res))
        _this.calculationOarkingFees()
      },
      fail: function(res) {
        setTimeout(() => {
          Taro.navigateBack({
            delta: 1
          })
        }, 3000)
      }
    })
  }
  formatePaymentInfo = data => {
    console.log('data', data)
    let newData = {}
    // 订单编号
    newData.xx_order_id = data.xx_order_id
    newData.free_minute_text = data.free_minute_text
    // 停车时间
    newData.parking_duration = data.stay_minute
    // 停车时间小时
    newData.parking_duration_hour = util.removeDecimalPoints(
      data.stay_minute / 60
    )
    // 停车时间分钟
    newData.parking_duration_minute = data.stay_minute % 60
    // 入场时间
    newData.start_time = moment(data.entry_time).format('YYYY-MM-DD HH:mm:ss')
    // 收费标准
    newData.charging_standard = data.per_price
    // 金卡会员专享免费时长
    newData.free_time = data.free_minute
    // 用户礼金
    newData.c_coupon = data.c_coupon
    // 停车费用
    newData.parking_fees = data.price
    // 停车券面值
    newData.car_coupon_face_value = 0

    // 用户停车券列表
    newData.car_coupon_list = []
    data.car_coupon
      ? data.car_coupon.map((item, index) => {
          let car_coupon_item = {}
          car_coupon_item.list_id = item.list_id
          car_coupon_item.coupon_name = item.name
          car_coupon_item.code = item.code
          car_coupon_item.amount = item.amount
          newData.car_coupon_face_value = item.amount
          newData.car_coupon_list.push(car_coupon_item)
        })
      : null
    // 需要显示的停车券数量
    newData.show_car_coupon_number = Math.ceil(
      data.price / newData.car_coupon_face_value
    )
    // 显示的用户停车券列表
    newData.show_car_coupon_list = newData.car_coupon_list.slice(
      0,
      newData.show_car_coupon_number
    )
    // 可使用停车券抵扣的金额
    newData.car_coupon_deduction = 0
    newData.show_car_coupon_list
      ? data.car_coupon.map((item, index) => {
          newData.car_coupon_deduction += item.amount
        })
      : null
    // 用户礼金抵扣金额
    newData.c_coupon_deduction =
      data.price - newData.car_coupon_deduction <= 0
        ? 0
        : data.price - newData.car_coupon_deduction <= data.c_coupon
        ? data.price - newData.car_coupon_deduction
        : data.c_coupon
    return newData
  }
  switchChange = e => {
    this.setData({
      deduction_parking_fee: e.detail.value
    })
    this.calculationOarkingFees()
  }
  calculationOarkingFees = () => {
    const _this = this
    const { deduction_parking_fee, payment_info } = _this.data
    console.log()
    let pay_parking_fees = deduction_parking_fee
      ? payment_info.parking_fees -
        payment_info.car_coupon_deduction -
        payment_info.c_coupon_deduction
      : payment_info.parking_fees - payment_info.car_coupon_deduction
    _this.setData({
      pay_parking_fees: pay_parking_fees < 0 ? 0 : pay_parking_fees
    })
  }
  createParkingOrder = e => {
    console.log(e.currentTarget.dataset.pay_parking_fees)
    let pay_parking_fees = e.currentTarget.dataset.pay_parking_fees
    let deduction_parking_fee = e.currentTarget.dataset.deduction_parking_fee
    const _this = this
    const { payment_info } = _this.data
    console.log('payment_info', payment_info)
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: constant.createParkingOrder,
      method: 'POST',
      data: {
        wechat: pay_parking_fees,
        c_coupon: deduction_parking_fee ? payment_info.c_coupon_deduction : 0,
        car_coupon: payment_info.show_car_coupon_list
      },
      success: function(res) {
        Taro.hideToast()
        console.log(res)
        _this.wexinPay(res.id)
      }
    })
  }
  wexinPay = order_id => {
    const _this = this
    util.request({
      url: constant.wexinPay,
      method: 'POST',
      data: {
        order_id: order_id
      },
      success: function(res) {
        switch (res.code) {
          case 0:
            let config = res.result
            config.timeStamp += ''
            config.success = function(data) {
              _this.paySucessModal('支付成功，请在15分钟内离场')
            }
            config.fail = function(err) {
              if (err.errMsg === 'requestPayment:fail cancel') {
                // 显示取消支付提示
                _this.payFaildModal('您取消了支付')
                Taro.hideToast()
              } else {
                // 支付失败，返回停车首页
                _this.payFaildModal('支付失败，请重试')
                Taro.hideToast()
              }
            }
            Taro.requestPayment(config)
            break
          case 1:
            // 完全用C券支付
            // 显示提示信息
            _this.paySucessModal('支付成功，请在15分钟内离场')
            break
          case -1:
            // 该停车费已经被支付
            // 显示提示信息
            _this.paySucessModal('该停车费已经被支付')
            break
          case -1400:
            //拿不到用户open_id无法支付，需要跳转登录页
            const gotoUrl = returnLoginUrlWithGotoUrl()
            Taro.redirectTo({
              url: gotoUrl
            })
            break
        }
      }
    })
  }
  payFaildModal = msg => {
    Taro.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      confirmText: '返回',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          // 返回停车首页
          Taro.navigateBack({
            delta: 1
          })
        }
      }
    })
  }
  paySucessModal = msg => {
    Taro.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      confirmText: '返回',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          // 返回会员中心页面
          Taro.switchTab({
            url: '/pages/usercenter/index/index'
          })
        }
      }
    })
  }
  config = {}

  render() {
    const {
      license_plate: license_plate,
      payment_info: payment_info,
      deduction_parking_fee: deduction_parking_fee,
      pay_parking_fees: pay_parking_fees
    } = this.state
    return (
      <View className="parking-info">
        <ScrollView></ScrollView>
        <View className="parking-info-content">
          <View className="license_plate">{license_plate}</View>
          <View className="parking-time">
            已入场
            <Text className="big-text">
              {payment_info.parking_duration_hour}
            </Text>
            时
            <Text className="big-text">
              {payment_info.parking_duration_minute}
            </Text>
            分钟
          </View>
          <View className="tips">结算后请15分钟内离场</View>
          <View className="weui-form-preview__bd border-style item-name">
            <View className="weui-form-preview__item">
              <View className="weui-form-preview__label name-color">
                入场时间
              </View>
              <View className="weui-form-preview__value value-color">
                {payment_info.start_time}
              </View>
            </View>
            <View className="weui-form-preview__item">
              <View className="weui-form-preview__label name-color">
                收费标准
              </View>
              <View className="weui-form-preview__value value-color">
                {payment_info.charging_standard}
              </View>
            </View>
            {payment_info.free_time && (
              <View className="weui-form-preview__item">
                <View className="weui-form-preview__label name-color">
                  金卡会员专享免费时长
                </View>
                <View className="weui-form-preview__value value-color-red">
                  {payment_info.free_time + '分钟'}
                </View>
              </View>
            )}
          </View>
          <View className="weui-cells_after-title item-name">
            <View className="weui-cell weui-cell_switch">
              <View className="weui-cell__bd item-name">用礼金抵扣停车费</View>
              <View className="weui-cell__ft">
                <Switch
                  type="checkbox"
                  color="#b31b1b"
                  checked
                  onChange={this.switchChange}
                ></Switch>
              </View>
            </View>
          </View>
          <View className="weui-form-preview__bd border-style item-name">
            <View className="weui-form-preview__item">
              <View className="weui-form-preview__label name-color">
                停车费用
              </View>
              <View className="weui-form-preview__value value-color">
                {'￥' + payment_info.parking_fees}
              </View>
            </View>
            {/*  停车券抵扣  */}
            {payment_info.show_car_coupon_list.map((item, index) => {
              return (
                <View key={item.list_id}>
                  <View className="weui-form-preview__item">
                    <View className="weui-form-preview__label name-color">
                      {item.coupon_name}
                    </View>
                    <View className="weui-form-preview__value value-color-red">
                      {'-￥' + item.amount}
                    </View>
                  </View>
                </View>
              )
            })}
            {deduction_parking_fee && (
              <View className="weui-form-preview__item">
                <View className="weui-form-preview__label name-color">
                  礼金抵扣
                </View>
                <View className="weui-form-preview__value value-color-red">
                  {'-￥' + payment_info.c_coupon_deduction}
                </View>
              </View>
            )}
          </View>
        </View>
        <View className="payment">
          <View
            className="payment-button"
            onClick={this.createParkingOrder}
            data-pay_parking_fees={pay_parking_fees}
            data-deduction_parking_fee={deduction_parking_fee}
          >
            {'支付停车费 ￥' + pay_parking_fees}
          </View>
        </View>
      </View>
    )
  }
}

export default _C
