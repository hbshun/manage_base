import {
  Block,
  View,
  Input,
  RadioGroup,
  Label,
  Radio,
  Picker,
  Button
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/complementInformation/index.js
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import moment from 'moment'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    name: '',
    date: '请选择生日（必填）',
    account_id: '',
    sex_options: constant.SEX_OPTIONS,
    sex: '',
    max_age_date: '',
    min_age_date: '',
    now: '',
    gotoUrl: '',
    user_from: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id,
      gotoUrl: options.gotoUrl,
      // 会员中心页面设置的user_from，扫描导购二维码进入小程序才会有值，不显示跳过按钮，其他情况都可以跳过
      user_from: wx.globalData.user_from === 'undefined' ? true : false,
      // 会员中心页面设置的sourse，点击微信公众号底部菜单栏进入小程序才会有值，不显示跳过按钮，其他情况都可以跳过
      sourse: wx.globalData.sourse === undefined ? true : false
    })
    console.log('gotoUrl', this.data.gotoUrl)
    console.log('wx.globalData.user_from', wx.globalData.user_from)
    console.log('wx.globalData.sourse', wx.globalData.sourse)
    console.log('user_from', this.data.user_from)
    console.log('sourse', this.data.sourse)
  }
  componentDidMount = () => {
    this.resetDate()
  }
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  resetDate = () => {
    let now = moment().format('YYYY-MM-DD')
    let max_age_date = moment()
      .subtract(80, 'years')
      .calendar()
    let min_age_date = moment()
      .subtract(13, 'years')
      .calendar()
    this.setData({
      max_age_date,
      min_age_date,
      now
    })
  }
  bindNameChange = e => {
    this.setData({
      name: e.detail.value
    })
  }
  bindSexChange = e => {
    this.setData({
      sex: e.detail.value
    })
  }
  bindDateChange = e => {
    let select_date = e.detail.value
    const { max_age_date, min_age_date, now } = this.data
    if (moment(select_date).isAfter(min_age_date, 'day')) {
      util.showModalMsg({
        content: '未满13周岁，无法注册会员卡'
      })
    } else if (
      moment(select_date).isBetween(max_age_date, min_age_date, 'day')
    ) {
      this.setData({
        date: e.detail.value
      })
    }
  }
  complementInformation = () => {
    const _this = this
    const { date, name, sex, account_id } = _this.data

    if (name === '' && date === '请选择生日（必填）' && sex === '') {
      util.showModalMsg({
        content: '请输入姓名，性别和生日'
      })
    } else if (name === '' && date === '请选择生日（必填）') {
      util.showModalMsg({
        content: '请输入姓名和生日'
      })
    } else if (date === '请选择生日（必填）' && sex === '') {
      util.showModalMsg({
        content: '请选择性别和生日'
      })
    } else if (name === '' && sex === '') {
      util.showModalMsg({
        content: '请输入姓名和性别'
      })
    } else if (sex === '') {
      util.showModalMsg({
        content: '请选择性别'
      })
    } else if (name === '') {
      util.showModalMsg({
        content: '请输入姓名'
      })
    } else if (date === '请选择生日（必填）') {
      util.showModalMsg({
        content: '请选择生日'
      })
    } else {
      util.request({
        url: `${constant.updateUserInfo}?accountid=${account_id}&mebname=${name}&sex=${sex}&birthday=${date}`,
        method: 'POST',
        success: function(res) {
          if (res.success) {
            Taro.showToast({
              title: '成功',
              icon: 'success',
              duration: 2000
            })
            _this.redirectToUrl()
          }
        }
      })
    }
  }
  redirectToUrl = () => {
    // 点击跳过按钮时，后台（天一）要求向后台打印日志
    util.printLog(
      'pages/usercenter/complementInformation/index',
      'skip_bir',
      '信息补全页面，点击跳过按钮'
    )
    // 跳转到指定地址
    const { gotoUrl } = this.data
    Taro.reLaunch({
      url: gotoUrl
    })
  }
  config = {
    navigationBarTitleText: '信息补全',
    enablePullDownRefresh: false
  }

  render() {
    const {
      sex_options: sex_options,
      date: date,
      max_age_date: max_age_date,
      now: now,
      user_from: user_from,
      sourse: sourse
    } = this.state
    return (
      <Block>
        <View className="complement-info">
          <View className="weui-cells weui-cells_after-title">
            <View className="weui-cell weui-cell_input">
              <View className="weui-cell__hd">
                <View className="weui-label">姓名</View>
              </View>
              <View className="weui-cell__bd">
                <Input
                  className="weui-input"
                  placeholder="真实姓名（必填）"
                  onInput={this.bindNameChange}
                  maxlength="10"
                  focus="true"
                  confirmType="next"
                ></Input>
              </View>
            </View>
            <View className="weui-cell weui-cell_input" style="height:88rpx;">
              <View className="weui-cell__hd">
                <View className="weui-label">性别</View>
              </View>
              <View className="weui-cell__bd">
                <RadioGroup
                  className="radio-group"
                  onChange={this.bindSexChange}
                >
                  {sex_options.map((item, index) => {
                    return (
                      <Label className="radio" key="value">
                        <Radio value={item.name} checked={item.checked}></Radio>
                        {item.value}
                      </Label>
                    )
                  })}
                </RadioGroup>
              </View>
            </View>
            <View className="weui-cell weui-cell_input">
              <View className="weui-cell__hd">
                <View className="weui-label">生日</View>
              </View>
              <View className="weui-cell__bd">
                <Picker
                  mode="date"
                  value={date}
                  start={max_age_date}
                  end={now}
                  onChange={this.bindDateChange}
                >
                  <View className="weui-input">{date}</View>
                </Picker>
              </View>
            </View>
          </View>
        </View>
        <View className="weui-cells__tips tips">
          提示：生日当月有特殊福利，请慎重选择
        </View>
        <View className="weui-btn-area complete-button">
          <Button
            className="weui-btn"
            type="warn"
            onClick={this.complementInformation}
          >
            完成
          </Button>
          {(user_from || sourse) && (
            <Button
              className="weui-btn"
              type="default"
              onClick={this.redirectToUrl}
            >
              跳过
            </Button>
          )}
        </View>
      </Block>
    )
  }
}

export default _C
