import { Block, View, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/invoiceOpening/components/addInvoiceTitleInfo/index.js
import util from '../../../../../utils/util.js'
import constant from '../../../../../config/constant.js'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    account_id: '',
    title: '',
    tax_id: '',
    address: '',
    tel: '',
    bank_title: '',
    bank_account: '',
    invoice_type: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id | 274
    })
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  invoiceTitleChange = e => {
    console.log(e)
    this.setData({
      title: e.detail.value
    })
  }
  invoiceTaxIDChange = e => {
    this.setData({
      tax_id: e.detail.value
    })
  }
  invoiceAddressChange = e => {
    this.setData({
      address: e.detail.value
    })
  }
  invoiceTelChange = e => {
    this.setData({
      tel: e.detail.value
    })
  }
  invoiceBankTitleChange = e => {
    this.setData({
      bank_title: e.detail.value
    })
  }
  invoiceBankAccountChange = e => {
    this.setData({
      bank_account: e.detail.value
    })
  }
  saveInvoceTitle = () => {
    const _this = this
    const {
      account_id,
      title,
      tax_id,
      address,
      tel,
      bank_title,
      bank_account
    } = _this.data

    // 发票抬头类型：1为单位，2为个人
    let invoice_type = tax_id === '' ? 1 : 2

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.addInvoiceTitle,
      method: 'POST',
      //     "id": 1,
      //     "accountid": 274,
      //     "unionid": "string",
      //     "openid": "string",
      //     "invtype": "string", 1--公司 2--个人 / 其他
      // "title": "string",
      //     "taxno": "string",
      //     "bankaccount": "string",  -- - 开户行名称
      // "bankno": "string", --- 开户行帐号
      // "address": "string", --- 地址
      // "tel": "string"  -- - 电话
      data: {
        accountid: account_id,
        unionid: '',
        openid: '',
        invtype: invoice_type,
        title: title,
        taxno: tax_id,
        bankaccount: bank_title,
        bankno: bank_account,
        address: address,
        tel: tel
      },
      success: function(res) {
        Taro.hideToast()
        console.log('res', res)
        if (res.success) {
          Taro.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
        }
      }
    })
  }
  goBack = () => {
    Taro.navigateBack({
      delta: 1
    })
  }
  config = {}

  render() {
    return (
      <Block>
        <View className="weui-cells weui-cells_after-title">
          <View className="weui-cell weui-cell_input weui-cell_vcode">
            <View className="weui-cell__hd">
              <View className="weui-label">抬头</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                className="weui-input"
                placeholder="填入抬头名称（必填）"
                onInput={this.invoiceTitleChange}
              ></Input>
            </View>
          </View>
          <View className="weui-cell weui-cell_input">
            <View className="weui-cell__hd">
              <View className="weui-label">税号</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                className="weui-input"
                placeholder="填入纳税人识别号"
                onInput={this.invoiceTaxIDChange}
              ></Input>
            </View>
          </View>
          <View className="weui-cell weui-cell_input">
            <View className="weui-cell__hd">
              <View className="weui-label">地址</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                className="weui-input"
                placeholder="填入公司地址"
                onInput={this.invoiceAddressChange}
              ></Input>
            </View>
          </View>
          <View className="weui-cell weui-cell_input">
            <View className="weui-cell__hd">
              <View className="weui-label">电话号码</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                className="weui-input"
                placeholder="填入联系电话"
                onInput={this.invoiceTelChange}
              ></Input>
            </View>
          </View>
          <View className="weui-cell weui-cell_input">
            <View className="weui-cell__hd">
              <View className="weui-label">开户银行</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                className="weui-input"
                placeholder="填入开户银行名称"
                onInput={this.invoiceBankTitleChange}
              ></Input>
            </View>
          </View>
          <View className="weui-cell weui-cell_input">
            <View className="weui-cell__hd">
              <View className="weui-label">银行账号</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                className="weui-input"
                placeholder="填入银行账号"
                onInput={this.invoiceBankAccountChange}
              ></Input>
            </View>
          </View>
        </View>
        <View className="weui-btn-area button">
          <Button
            className="weui-btn"
            type="warn"
            onClick={this.saveInvoceTitle}
          >
            保存
          </Button>
          <Button className="weui-btn" type="default" onClick={this.goBack}>
            返回
          </Button>
        </View>
      </Block>
    )
  }
}

export default _C
