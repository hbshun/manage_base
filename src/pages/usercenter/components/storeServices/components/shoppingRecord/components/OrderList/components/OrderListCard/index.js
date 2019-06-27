import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/storeServices/components/shoppingRecord/components/OrderList/components/OrderListCard/index.js
import util from '../../../../../../../../../../utils/util.js'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    order_list_info: 'default value',
    account_id: ''
  }
  _observeProps = []
  state = {}
  goToInvocie = () => {
    Taro.navigateTo({
      url: `/pages/usercenter/invoiceOpening/index?order_number=${this.properties.order_list_info.id}&account_id=${this.properties.account_id}&type=offline`
    })
  }
  goToInvocieInfo = () => {
    console.log('order_list_info', this.properties.order_list_info)
    let invoice_url = encodeURIComponent(
      this.properties.order_list_info.invoice_url
    )
    Taro.navigateTo({
      url: `/pages/usercenter/InvoiceInfo/index?invoice_url=${invoice_url}`
    })
  }
  config = {
    component: true
  }

  render() {
    const {
      order_list_info: order_list_info,
      account_id: account_id
    } = this.props
    const {} = this.state
    return (
      <View className="order-list-card">
        <View className="order-info">
          <View className="order-info-item">
            <View className="shop-name">{order_list_info.shop_name}</View>
            <View className="total-amount">
              {'￥' + order_list_info.total_amount}
            </View>
          </View>
          <View className="order-info-item">
            <View className="create-time">{order_list_info.create_time}</View>
            <View className="point">
              {'获得积分：' + order_list_info.point}
            </View>
          </View>
        </View>
        {/*  有退货显示invoicemsg信息  */}
        {order_list_info.is_refund ? (
          <View
            className="open-invoice"
            style={'color:' + (order_list_info.invoiced ? '#ccc' : '')}
          >
            {order_list_info.invoicemsg}
          </View>
        ) : order_list_info.invoiced && order_list_info.invoice_url !== '' ? (
          <View
            className="open-invoice"
            style={'color:' + (order_list_info.invoiced ? '#333' : '')}
            onClick={this.goToInvocieInfo}
          >
            {order_list_info.invoicemsg}
          </View>
        ) : order_list_info.invoiced &&
          order_list_info.invoicemsg !== '' &&
          order_list_info.invoice_url === '' ? (
          <View
            className="open-invoice"
            style={'color:' + (order_list_info.invoiced ? '#ccc' : '')}
          >
            {order_list_info.invoicemsg}
          </View>
        ) : (
          <View
            className="open-invoice"
            style={'color:' + (order_list_info.invoiced ? '#ccc' : '')}
            onClick={this.goToInvocie}
          >
            开立发票
          </View>
        )}
        {/*  发票开立完成显示发票已开，可以跳转到发票信息页面  */}
        {/*  无法开立发票，显示invoicemsg信息  */}
        {/*  正常显示开立发票  */}
      </View>
    )
  }
}

export default _C
