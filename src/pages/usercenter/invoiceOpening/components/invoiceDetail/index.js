import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/invoiceOpening/components/invoiceDetail/index.js
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
  deleteInvoiceTitle = () => {
    const _this = this
    let { invoice_id } = _this.data

    Taro.showModal({
      title: '提示',
      content: '确定删除当前发票抬头信息？',
      success(res) {
        if (res.confirm) {
          util.request({
            url: `${constant.deleteInvoiceTitle}?id=${invoice_id}`,
            method: 'GET',
            success: function(res) {
              if (res.success) {
                Taro.navigateBack({
                  delta: 1
                })
                Taro.showToast({
                  title: '删除成功',
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
        } else if (res.cancel) {
          console.log('取消删除')
        }
      }
    })
  }
  editInvoiceTitle = () => {
    Taro.redirectTo({
      url: `/pages/usercenter/invoiceOpening/components/editInvoiceTitleInfo/index?invoice_id=${this.data.invoice_id}`
    })
  }
  config = {}

  render() {
    const { invoice_info: invoice_info } = this.state
    return (
      <View className="invoice-detail">
        <View className="compant-name">{invoice_info.title}</View>
        <View className="invoice-info">
          <View className="invoice-item">
            <View className="title">
              税<View className="space"></View>号
            </View>
            <View className="value">{invoice_info.tax_id}</View>
          </View>
          <View className="invoice-item">
            <View className="title">
              地<View className="space"></View>址
            </View>
            <View className="value">{invoice_info.address}</View>
          </View>
          <View className="invoice-item">
            <View className="title">电话号码</View>
            <View className="value">{invoice_info.tel}</View>
          </View>
          <View className="invoice-item">
            <View className="title">开户银行</View>
            <View className="value">{invoice_info.bank_title}</View>
          </View>
          <View className="invoice-item">
            <View className="title">银行账户</View>
            <View className="value">{invoice_info.bank_account}</View>
          </View>
        </View>
        <View className="button-content">
          <View className="button-text" onClick={this.deleteInvoiceTitle}>
            删除
          </View>
          <View
            className="button-text button-interval"
            onClick={this.editInvoiceTitle}
          >
            修改
          </View>
        </View>
      </View>
    )
  }
}

export default _C
