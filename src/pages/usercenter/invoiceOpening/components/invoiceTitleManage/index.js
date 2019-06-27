import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/invoiceOpening/components/invoiceTitleManage/index.js
import util from '../../../../../utils/util.js'
import constant from '../../../../../config/constant.js'
import AddInvoiceTitle from '../addInvoiceTitle/index'
import InvoiceTitleCard from '../invoiceTitleCard/index'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    account_id: '',
    invoice_list: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id | '274'
    })
    this.getInvoiceTitleList()
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  getInvoiceTitleList = () => {
    const _this = this

    let { account_id, invoice_list } = _this.data

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: `${constant.getInvoiceTitleList}?accountid=${account_id}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        console.log('res', res)
        if (res.success) {
          _this.setData({
            invoice_list: _this.formatData(res.data)
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
        }
      }
    })
  }
  formatData = data => {
    const newData = []
    data.map((item, index) => {
      let dataItem = {}
      dataItem.account_id = item.accountid
      dataItem.address = item.address
      dataItem.bank_title = item.bankaccount
      dataItem.bank_account = item.bankno
      dataItem.id = item.id
      dataItem.invoice_type = item.invtype
      dataItem.openid = item.openid
      dataItem.tax_id = item.taxno
      dataItem.tel = item.tel
      dataItem.title = item.title
      if (item.title.length > 16) {
        dataItem.title = `${util.substring(item.title, 0, 16)}...`
      }
      dataItem.unionid = item.unionid
      newData.push(dataItem)
    })
    return newData
  }
  config = {}

  render() {
    const { invoice_list: invoice_list, account_id: account_id } = this.state
    return (
      <Block>
        {invoice_list.map((item, index) => {
          return (
            <View key={'invoice-' + item.id}>
              <InvoiceTitleCard invoiceInfo={item}></InvoiceTitleCard>
            </View>
          )
        })}
        <AddInvoiceTitle accountId={account_id}></AddInvoiceTitle>
      </Block>
    )
  }
}

export default _C
