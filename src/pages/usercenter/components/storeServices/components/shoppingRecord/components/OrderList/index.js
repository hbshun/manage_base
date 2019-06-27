import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import OrderListCard from './components/OrderListCard/index'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    order_list: 'default value',
    account_id: ''
  }
  _observeProps = []
  state = {}
  config = {
    component: true
  }

  render() {
    const { order_list: order_list, account_id: account_id } = this.props
    const {} = this.state
    return order_list.map((item, index) => {
      return (
        <View key="shopping-recoed-{index}">
          <OrderListCard
            orderListInfo={item}
            accountId={account_id}
          ></OrderListCard>
          {/*  <view class='order-list-card'>
                                                                                                                                 <view class='order-info' bindtap='redirectToOrderDetail'>
                                                                                                                                   <view class='order-info-item'>
                                                                                                                                     <view class='shop-name'>
                                                                                                                                       <text style='color:{{item.is_refund?"#0BB20C":""}}'>{{item.is_refund?"退款 ":""}}</text>{{item.shop_name}}
                                                                                                                                     </view>
                                                                                                                                     <view class='total-amount' style='color:{{item.is_refund?"#0BB20C":""}}'>{{item.is_refund?"+":""}}￥{{item.total_amount}}</view>
                                                                                                                                   </view>
                                                                                                                                   <view class='order-info-item'>
                                                                                                                                     <view class='create-time'>{{item.create_time}}</view>
                                                                                                                                     <view class='point'>{{item.is_refund?"扣减积分：":"获得积分："}}{{item.point}}</view>
                                                                                                                                   </view>
                                                                                                                                 </view>
                                                                                                                                 <view wx:if="{{item.invoiced}}" class='open-invoice' style='display:{{item.is_refund?"none":"block"}}; color:{{item.invoiced?"#ccc":""}}'>发票已开</view>
                                                                                                                                 <view wx:else class='open-invoice' style='display:{{item.is_refund?"none":"block"}}; color:{{item.invoiced?"#ccc":""}}' bindtap='goToInvocie'>开立发票</view>
                                                                                                                               </view>  */}
        </View>
      )
    })
  }
} // pages/usercenter/components/storeServices/components/shoppingRecord/components/OrderList/index.wxml

export default _C
