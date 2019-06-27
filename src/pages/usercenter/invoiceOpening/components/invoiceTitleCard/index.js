import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    invoice_info: {}
  }
  _observeProps = []
  state = {}
  redirectToInvoiceDetail = () => {
    Taro.redirectTo({
      url: `/pages/usercenter/invoiceOpening/components/invoiceDetail/index?invoice_id=${this.properties.invoice_info.id}`
    })
  }
  config = {
    component: true
  }

  render() {
    const { invoice_info: invoice_info } = this.props
    const {} = this.state
    return (
      <View className="invoice-title-card">
        <View className="invoice-info">
          <View className="company-name">{invoice_info.title}</View>
          <View className="duty-paragraph">
            {'税号: ' + invoice_info.tax_id}
          </View>
        </View>
        <View className="invoice-button" onClick={this.redirectToInvoiceDetail}>
          >
        </View>
      </View>
    )
  }
} // pages/usercenter/invoiceOpening/components/invoiceTitleCard/index.js

export default _C
