import { Block, View, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/invoiceOpening/components/editInvoiceTitleInfo/index.js
import util from '../../../../../utils/util.js'
import constant from '../../../../../config/constant.js'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    invoice_id: '',
    invoice_info: {}
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      invoice_id: options.invoice_id
    })
    this.getInvoiceTitleInfo()
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  getInvoiceTitleInfo = () => {
    const _this = this

    let { invoice_id, invoice_info } = _this.data

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: `${constant.getInvoiceTitleInfo}?id=${invoice_id}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        console.log('res', res)
        if (res.success) {
          let invoice_info = {
            account_id: res.data.accountid,
            address: res.data.address,
            bank_title: res.data.bankaccount,
            bank_account: res.data.bankno,
            id: res.data.id,
            invoice_type: res.data.invtype,
            openid: res.data.openid,
            tax_id: res.data.taxno,
            tel: res.data.tel,
            title: res.data.title,
            unionid: res.data.unionid
          }
          _this.setData({
            invoice_info
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
        }
      }
    })
  }
  invoiceTitleChange = e => {
    console.log(e)
    this.setData({
      invoice_info: {
        title: e.detail.value
      }
    })
  }
  invoiceTaxIDChange = e => {
    this.setData({
      invoice_info: {
        tax_id: e.detail.value
      }
    })
  }
  invoiceAddressChange = e => {
    this.setData({
      invoice_info: {
        address: e.detail.value
      }
    })
  }
  invoiceTelChange = e => {
    this.setData({
      invoice_info: {
        tel: e.detail.value
      }
    })
  }
  invoiceBankTitleChange = e => {
    this.setData({
      invoice_info: {
        bank_title: e.detail.value
      }
    })
  }
  invoiceBankAccountChange = e => {
    this.setData({
      invoice_info: {
        bank_account: e.detail.value
      }
    })
  }
  updateInvoiceTitle = () => {
    const _this = this
    const { account_id, invoice_info } = _this.data

    // 发票抬头类型：1为单位，2为个人
    let invoice_type = invoice_info.tax_id === '' ? 1 : 2

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.updateInvoiceTitle,
      method: 'POST',
      data: {
        id: invoice_info.id,
        accountid: invoice_info.account_id,
        unionid: invoice_info.unionid,
        openid: invoice_info.openid,
        invtype: invoice_type,
        title: invoice_info.title,
        taxno: invoice_info.tax_id,
        bankaccount: invoice_info.bank_title,
        bankno: invoice_info.bank_account,
        address: invoice_info.address,
        tel: invoice_info.tel
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
    const { invoice_info: invoice_info } = this.state
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
                value={invoice_info.title}
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
                value={invoice_info.tax_id}
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
                value={invoice_info.address}
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
                value={invoice_info.tel}
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
                value={invoice_info.bank_title}
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
                value={invoice_info.bank_account}
                onInput={this.invoiceBankAccountChange}
              ></Input>
            </View>
          </View>
        </View>
        <View className="weui-btn-area button">
          <Button
            className="weui-btn"
            type="warn"
            onClick={this.updateInvoiceTitle}
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
