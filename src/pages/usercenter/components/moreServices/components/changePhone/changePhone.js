import { Block, View, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/moreServices/components/changePhone/changePhone.js
import util from '../../../../../../utils/util.js'
import constant from '../../../../../../config/constant.js'
import './changePhone.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    service_phone: constant.SERVICE_PHONE,
    current_phone: '',
    account_id: '',
    new_phone: '',
    verification_code: '',
    time: 60,
    showCountDown: false
  }
  timer = null
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      current_phone: options.phone,
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
  bindNewPhone = e => {
    this.setData({
      new_phone: e.detail.value
    })
  }
  bindVerificationCode = e => {
    this.setData({
      verification_code: e.detail.value
    })
  }
  countDown = () => {
    const _this = this
    let { time } = _this.data

    if (!_this.timer) {
      _this.timer = setInterval(() => {
        if (time <= 0) {
          clearInterval(_this.timer)
          ;(_this.timer = null),
            _this.setData({
              time: 60,
              showCountDown: false
            })
        }
        time--
        _this.setData({
          time
        })
      }, 1000)
    }
  }
  sendSMS = () => {
    util.request({
      hasToken: false,
      url: constant.sendSMS,
      method: 'POST',
      data: {
        phone: this.data.new_phone
      },
      success: res => {
        console.log('---> sms code: ', res)
      },
      fail: () => {
        util.showModalError('获取手机验证码失败，请稍后重试')
      }
    })
  }
  resetVerificationCodeCountdown = () => {
    const _this = this
    // 清除计时器
    clearInterval(_this.timer)
    ;(_this.timer = null),
      // 显示获取验证码按钮
      _this.setData({
        showCountDown: false,
        // 倒计时恢复到60s
        time: 60
      })
  }
  handleGetVerificationCode = () => {
    let { new_phone, current_phone } = this.data
    // 验证手机号是否为空，手机号格式是否正确
    if (util.isEmpty(new_phone) || !util.isPhone(new_phone)) {
      util.showModalError('请输入正确的手机号')
      return
    }
    // 验证手机号是否和之前手机号一致
    if (new_phone === current_phone) {
      util.showModalError('您输入的手机号和现有手机号一致，请仔细检查')
      return
    }
    this.setData({
      showCountDown: true
    })
    this.countDown()
    this.sendSMS()
  }
  redirectToUserCenter = () => {
    Taro.navigateBack({
      delta: 1
    })
  }
  modifyPhone = () => {
    const _this = this
    let { account_id, phone, new_phone, verification_code } = _this.data
    // 校验验证码是否为空
    if (util.isEmpty(verification_code)) {
      util.showModalError('请输入验证码')
      return
    }
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 2000
    })
    util.request({
      url: constant.changePhone,
      method: 'POST',
      data: {
        new_phone: new_phone,
        sms_code: verification_code
      },
      success: function(res) {
        Taro.hideToast()
        Taro.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
        _this.redirectToUserCenter()
      },
      fail: function() {
        // 重置验证码倒计时
        _this.resetVerificationCodeCountdown()
      }
    })
  }
  noVerificationCode = () => {
    const _this = this
    Taro.showModal({
      // title: '提示',
      content: `如您在验证码发送后超时仍未接收到验证码，可致电${_this.data.service_phone}咨询解决！`,
      confirmText: '致电',
      cancelText: '返回',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击致电')
          Taro.makePhoneCall({
            phoneNumber: _this.data.service_phone
          })
        } else {
          console.log('用户点击返回')
        }
      }
    })
  }
  config = {
    navigationBarTitleText: '改绑手机',
    enablePullDownRefresh: false
  }

  render() {
    const {
      current_phone: current_phone,
      time: time,
      showCountDown: showCountDown
    } = this.state
    return (
      <View className="page">
        <View className="change-phone">
          <View className="current-phone">
            <View>当前手机号</View>
            <View className="current-phone-value">{current_phone}</View>
          </View>
          <View className="input-form">
            <View className="weui-cells weui-cells_after-title">
              <View className="weui-cell weui-cell_input">
                <View className="weui-cell__hd">
                  <View className="weui-label">新手机号</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    type="number"
                    onInput={this.bindNewPhone}
                    placeholder="请输入新手机号"
                    maxlength="11"
                  ></Input>
                </View>
              </View>
              <View className="weui-cell weui-cell_input weui-cell_vcode">
                <View className="weui-cell__hd">
                  <View className="weui-label">验证码</View>
                </View>
                <View className="weui-cell__bd">
                  <Input
                    className="weui-input"
                    type="number"
                    onInput={this.bindVerificationCode}
                    placeholder="请输入验证码"
                    maxlength="4"
                  ></Input>
                </View>
                <View className="weui-cell__ft">
                  {showCountDown ? (
                    <View className="weui-vcode-btn color999">
                      {time + '秒后重新获取'}
                    </View>
                  ) : (
                    <View
                      className="weui-vcode-btn"
                      onClick={this.handleGetVerificationCode}
                    >
                      获取验证码
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View className="weui-btn-area">
              <Button
                className="weui-btn"
                type="warn"
                onClick={this.modifyPhone}
              >
                重新绑定
              </Button>
              <Button className="weui-btn" onClick={this.redirectToUserCenter}>
                返回
              </Button>
            </View>
          </View>
          <View className="weui-footer weui-footer_fixed-bottom">
            <View className="weui-footer__links">
              <View
                className="weui-footer__link"
                onClick={this.noVerificationCode}
              >
                收不到验证码？
              </View>
            </View>
            <View className="weui-footer__text">
              北京汉光百货有限责任公司 © 2019 版权所有
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default _C
