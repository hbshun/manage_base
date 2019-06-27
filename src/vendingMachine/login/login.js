import { Block, View, Image, Input, Form, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// login.js
import constant from '../../config/constant.js'
import util from '../../utils/util.js'
import GIO_utils from '../../utils/GIO_utils.js'

import './login.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    showCountDown: false,
    time: 60,
    inputValuePhone: '',
    inputValueCode: '',
    showTopTips: false,
    tipsContent: '',
    extra_info: null,
    gotoUrl: '',
    formId: '', // 用于发模板消息
    code: ''
  }
  timer = null
  componentWillMount = (options = this.$router.params || {}) => {
    util.printLog('wechat_app', 'go_to_register', '')
    console.log('登录页options', options)
    console.log('登录页gotoUrl', options.gotoUrl)
    console.log(
      '登录页decodeURIComponent(options.gotoUrl)',
      decodeURIComponent(options.gotoUrl)
    )
    this.setData({
      gotoUrl: decodeURIComponent(options.gotoUrl)
    })
  }
  componentDidMount = () => {
    // console.log('this.gotoUrl: ', this.data.gotoUrl);
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
  sendSMS = () => {
    const _this = this
    const { inputValuePhone } = _this.data
    util.request({
      hasToken: false,
      url: constant.sendSMS,
      method: 'POST',
      data: {
        phone: inputValuePhone
      },
      success: res => {
        console.log('---> sms code: ', res)
      },
      fail: () => {
        util.showModalError('获取手机验证码失败，请稍后重试')
      }
    })
  }
  countDown = () => {
    const _this = this
    let { time, showCountDown } = _this.data

    if (!_this.timer) {
      _this.timer = setInterval(() => {
        if (time <= 0) {
          clearInterval(_this.timer)
          _this.timer = null
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
  resetVerificationCodeCountdown = () => {
    const _this = this
    // 清除计时器
    clearInterval(_this.timer)
    _this.timer = null
    // 显示获取验证码按钮
    _this.setData({
      showCountDown: false,
      // 倒计时恢复到60s
      time: 60
    })
  }
  handleCountDown = e => {
    const _this = this
    let { inputValuePhone } = _this.data
    // 验证手机号是否为空，手机号格式是否正确
    if (util.isEmpty(inputValuePhone) || !util.isPhone(inputValuePhone)) {
      util.showModalError('请输入正确的手机号')
      return
    }
    _this.setData({
      showCountDown: true
    })
    _this.countDown()
    _this.sendSMS()
    /**
     * 重点：
     * code的获取需要在 getUserInfo之前。
     * 原因：
     *  code对应于 session_key，code的获取有可能会造成session_key的失效（不一定，取决于微信的策略，
     * 有时候获取code会获得同样的session_key）,getUserInfo 拿到的加密信息需要与之对应的code（session_key）来进行解密
     * “同意协议并注册”按钮： 触发 getUserInfo执行
     *
     */
    Taro.login({
      success: function(res) {
        if (res.code) {
          // 向后台发起登录请求
          _this.setData({
            code: res.code
          })
        }
      }
    })
  }
  commitPhoneNumber = e => {
    const _this = this
    const { inputValueCode } = _this.data
    // 校验验证码是否为空
    if (util.isEmpty(inputValueCode)) {
      util.showModalError('请输入验证码')
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
      // 拒绝授权，不作处理
      // this.loginBind(e.detail);
    }
  }
  storageFormId = e => {
    this.data.formId = e.detail.formId || ''
  }
  loginBind = userInfo => {
    const _this = this
    const { inputValuePhone, inputValueCode, gotoUrl, code } = _this.data

    let rawData = ''
    let signature = ''
    let encryptedData = ''
    let iv = ''

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 10000
    })

    util.printLog('wechat_app', 'register_posted', inputValuePhone)

    if (userInfo) {
      rawData = userInfo.rawData
      signature = userInfo.signature
      encryptedData = userInfo.encryptedData
      iv = userInfo.iv
    }

    util.request({
      hasToken: false,
      url: constant.loginBind,
      method: 'POST',
      data: {
        app_id: constant.appId,
        wechat_app_code: code,
        phone: inputValuePhone,
        sms_code: inputValueCode,
        raw_data: rawData,
        signature: signature,
        encrypted_data: encryptedData,
        iv: iv
      },
      success: data => {
        console.log('data', data)
        util.user.setUserInfo(util.user.formatUserInfo(data))
        util.postFormId(_this.data.formId, 'login')
        let userId = ''
        Taro.getStorage({
          key: 'key_user',
          success: function(res) {
            console.log('res', res)
            userId = res.data.userId
            console.log(res)
            Taro.getUserInfo({
              success: function(res) {
                wx.globalData.gio('setVisitor', res.userInfo)
                wx.globalData.gio('setUserId', userId)
              },
              fail(err) {
                console.log(err)
              }
            })
          },
          fail: function(err) {
            console.log(err)
          }
        })

        GIO_utils.set_login_user_info_GIO()
        console.log('登录页url', gotoUrl)
        // 判断用户来源，如果扫描导购二维码进来，wx.globalData.user_from有值，跳转到用户信息补全页面，不允许跳过
        // 如果用户没有生日信息，跳转到用户信息补全页面，允许跳过
        // 如果用户有生日等信息，跳转到用户登录之前的页面gotoUrl
        // 获取用户信息
        util.request({
          url: constant.getUserSimpleInfo,
          method: 'GET',
          success: function(res) {
            if (res.member.birthday) {
              Taro.reLaunch({
                url: `${gotoUrl}`
              })
            } else {
              Taro.reLaunch({
                url: `/pages/usercenter/complementInformation/index?account_id=${res.level.account_id}&&gotoUrl=${gotoUrl}`
              })
            }
          }
        })
      },
      fail: err => {
        Taro.hideToast()
        // 重置验证码倒计时
        _this.resetVerificationCodeCountdown()
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
  clickToProtocol = () => {
    Taro.navigateTo({
      url: '/packageA/loginProtocol/loginProtocol'
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
        <View className="logo-content">
          <Image
            className="logo"
            src={require('../../common/images/hg_logo.png')}
          ></Image>
        </View>
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
                focus="true"
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
          <Form onSubmit={this.storageFormId} reportSubmit="true">
            <Button
              openType="getUserInfo"
              type="warn"
              onGetuserinfo={this.commitPhoneNumber}
              formType="submit"
            >
              登录
            </Button>
          </Form>
          <View className="warning-view" onClick={this.clickToProtocol}>
            已阅读并同意
            <Span className="warning-span">《汉光百货+用户注册协议》</Span>
          </View>
        </View>
        <View className="login-cannotreceive-code">
          <View className="btn-center" onClick={this.goToIndex}>
            先逛逛
          </View>
        </View>
        <View className="height-100"></View>
        <View className="weui-footer weui-footer_fixed-bottom">
          <View className="login-cannotreceive-code verify-code">
            <View className="btn-center" onClick={this.handleMakePhoneCall}>
              收不到验证码？
            </View>
          </View>
        </View>
      </Block>
    )
  }
}

export default _C
