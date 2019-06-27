import { Block, View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    account_id: ''
  }
  _observeProps = []
  state = {}
  addInvoiceTitleInfo = () => {
    Taro.redirectTo({
      url: `/pages/usercenter/invoiceOpening/components/addInvoiceTitleInfo/index?${this.properties.account_id}`
    })
  }
  config = {
    component: true
  }

  render() {
    const { account_id: account_id } = this.props
    return (
      <View className="add-invoice-title" onClick={this.addInvoiceTitleInfo}>
        <Text className="add-invoice-icon">+</Text>
        <Text className="add-invoice-title-button">添加发票抬头</Text>
      </View>
    )
  }
} // pages/usercenter/invoiceOpening/components/addInvoiceTitle/index.js

export default _C
