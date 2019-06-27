import { Block, View, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// login.js
import constant from '../../config/constant.js'
import util from '../../utils/util.js'

import './login.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    timer: null,
    showCountDown: false,
    time: 60,
    inputValuePhone: '',
    inputValueCode: '',
    showTopTips: false,
    tipsContent: '',
    extra_info: null
  }
  componentWillMount = (options = this.$router.params || {}) => {
    util.printLog('wechat_app', 'go_to_register', '')
  }
  componentDidMount = () => {}
  countDown = () => {
    let that = this
    this.setData({
      time: 60
    })
    if (!this.timer) {
      this.timer = setInterval(() => {
        if (this.data.time <= 0) {
          clearInterval(this.timer)
          this.timer = null
          this.setData({
            showCountDown: false
          })
        } else {
          this.setData({
            time: this.data.time - 1
          })
        }
      }, 1000)
    }
  }
  sendSMS = () => {
    util.request({
      hasToken: false,
      url: constant.sendSMS,
      method: 'POST',
      data: {
        phone: this.data.inputValuePhone
      },
      success: res => {
        console.log('---> sms code: ', res)
      },
      fail: () => {
        util.showModalError('获取手机验证码失败，请稍后重试')
      }
    })
  }
  handleCountDown = () => {
    if (this.verifyPhoneEmpty()) {
      return
    }

    if (this.verifyPhone()) {
      this.setData({
        showCountDown: true,
        showTopTips: false
      })
      this.countDown()
      this.sendSMS()
    }
  }
  bindInputPhone = e => {
    this.setData({
      inputValuePhone: e.detail.value
    })
  }
  bindInputCode = e => {
    this.setData({
      inputValueCode: e.detail.value
    })
  }
  verifyPhone = () => {
    const regExpPhone = /^1\d{10}$/
    console.log(regExpPhone.test(this.data.inputValuePhone))
    if (regExpPhone.test(this.data.inputValuePhone)) {
      return true
    }
    this.setData({
      showTopTips: true,
      tipsContent: '请输入正确的手机号码'
    })
    return false
  }
  verifyPhoneEmpty = () => {
    if (util.isEmpty(this.data.inputValuePhone)) {
      this.setData({
        showTopTips: true,
        tipsContent: '请输入手机号码'
      })
      return true
    }
    return false
  }
  verifyPhoneCode = () => {
    if (util.isEmpty(this.data.inputValueCode)) {
      this.setData({
        showTopTips: true,
        tipsContent: '请输入验证码'
      })
      return true
    }
    return false
  }
  commitPhoneNumber = e => {
    // 验证
    if (this.verifyPhoneEmpty()) {
      return
    }
    if (!this.verifyPhone()) {
      return
    }
    if (this.verifyPhoneCode()) {
      return
    }

    let raw_data = ''
    let signature = ''
    let encrypted_data = ''
    let iv = ''

    if (e.detail.userInfo) {
      // 确定按钮 是 获取用户权限的原生按钮，若能拿到userInfo，表明用户已经同意授权，若拿不到，则用户拒绝授权，不做处理
      // let { raw_data, signature, encrypted_data, iv} = e.detail;
      this.loginBind(e.detail)
    } else {
      this.loginBind()
    }
  }
  loginBind = userInfo => {
    const data = this.data
    util.printLog('wechat_app', 'register_posted', data.inputValuePhone)

    let rawData = ''
    let signature = ''
    let encryptedData = ''
    let iv = ''

    if (userInfo) {
      rawData = userInfo.rawData
      signature = userInfo.signature
      encryptedData = userInfo.encryptedData
      iv = userInfo.iv
    }

    Taro.login({
      success: function(res) {
        if (res.code) {
          // 向后台发起登录请求
          util.request({
            hasToken: false,
            url: constant.loginBind,
            method: 'POST',
            data: {
              app_id: constant.appId,
              wechat_app_code: res.code,
              phone: data.inputValuePhone,
              sms_code: data.inputValueCode,
              raw_data: rawData,
              signature: signature,
              encrypted_data: encryptedData,
              iv: iv
            },
            success: data => {
              console.log('登录成功')
              util.user.setUserInfo(util.user.formatUserInfo(data))
              Taro.switchTab({
                url: '/pages/usercenter/index/index'
              })
            }
          })
        } else {
          util.showModalError('获取用户登录态失败')
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: () => {
        util.showModalError('获取用户登录态失败')
      }
    })
  }
  handleMakePhoneCall = () => {
    Taro.makePhoneCall({
      phoneNumber: constant.SERVICE_PHONE
    })
  }
  goToIndex = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }
  config = {
    enablePullDownRefresh: false,
    navigationBarTitleText: '登录汉光百货+'
  }

  render() {
    const {
      tipsContent: tipsContent,
      showTopTips: showTopTips,
      time: time,
      showCountDown: showCountDown
    } = this.state
    return (
      <Block>
        {showTopTips && (
          <View className="weui-toptips weui-toptips_warn">{tipsContent}</View>
        )}
        <View className="weui-cells weui-cells_after-title mt200">
          <View className="weui-cell weui-cell_input weui-cell_vcode">
            <View className="weui-cell__hd">
              <View className="weui-label">手机号</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                className="weui-input"
                type="number"
                maxlength="11"
                autoFocus
                onInput={this.bindInputPhone}
                placeholder="请输入手机号"
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
                onInput={this.bindInputCode}
                placeholder="请输入验证码"
              ></Input>
            </View>
            <View className="weui-cell__ft">
              {showCountDown ? (
                <View className="weui-vcode-btn color999">
                  {time + '秒后重新获取'}
                </View>
              ) : (
                <View className="weui-vcode-btn" onClick={this.handleCountDown}>
                  获取验证码
                </View>
              )}
            </View>
          </View>
        </View>
        <View className="login-confirm">
          <Button
            openType="getUserInfo"
            type="primary"
            onGetuserinfo={this.commitPhoneNumber}
          >
            登录
          </Button>
        </View>
        <View className="login-cannotreceive-code" onClick={this.goToIndex}>
          先逛逛
        </View>
        <View className="height-100" onClick={this.goToIndex}></View>
        <View className="weui-footer weui-footer_fixed-bottom">
          <View
            className="login-cannotreceive-code verify-code"
            onClick={this.handleMakePhoneCall}
          >
            收不到验证码？
          </View>
        </View>
      </Block>
    )
  }
}

export default _C
