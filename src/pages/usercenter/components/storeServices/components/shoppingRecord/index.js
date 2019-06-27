import { Block, View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/storeServices/components/shoppingRecord/index.js
import util from '../../../../../../utils/util.js'
import constant from '../../../../../../config/constant.js'
import OrderList from './components/OrderList/index'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    pageSize: '10',
    pageIndex: '1',
    order_list: [],
    loadStatus: 'loading',
    account_id: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      account_id: options.account_id,
      order_list: []
    })
  }
  componentDidMount = () => {}
  componentDidShow = () => {
    this.setData({
      order_list: []
    })
    this.getShoppingRecord()
  }
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {
    this.setData({
      pageIndex: 1,
      order_list: [],
      loadStatus: 'loading'
    })
    this.getShoppingRecord()
  }
  onReachBottom = () => {
    let { pageSize, pageIndex } = this.data
    pageIndex++
    this.setData({
      pageIndex
    })
    this.getShoppingRecord()
  }
  onShareAppMessage = () => {}
  getShoppingRecord = () => {
    const _this = this
    let { pageSize, pageIndex, order_list, loadStatus, account_id } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.getShoppingRecord}?accountid=${account_id}&pageSize=${pageSize}&pageIndex=${pageIndex}`,
      method: 'GET',
      success: function(res) {
        Taro.stopPullDownRefresh()
        Taro.hideToast()
        if (res.success) {
          if (res.data) {
            // 上拉加载 - 加载完成
            loadStatus = ''
            let order_list_current = _this.formatShoppingRecordList(
              res.data.datalist
            )
            order_list = order_list.concat(order_list_current)
          } else {
            // 上拉加载 - 没有更多数据
            loadStatus = 'baseline'
          }
          console.log('res', order_list)
          _this.setData({
            order_list,
            loadStatus
          })
        } else {
          Taro.showModal({
            title: '提示',
            content: res.errmsg,
            confirmText: '返回',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                Taro.navigateBack({
                  delta: 1
                })
              }
            }
          })
          // 上拉加载 - 没有更多数据
          loadStatus = 'baseline'
        }
        _this.setData({
          loadStatus
        })
      }
    })
  }
  formatShoppingRecordList = data => {
    const _this = this
    let order_list = []
    data.map((item, index) => {
      let order_list_item = {}
      order_list_item.id = item.billno
      order_list_item.shop_name = ''
      if (item.goodstag.length > 27) {
        order_list_item.shop_name = `${util.substring(item.goodstag, 0, 30)}...`
      } else {
        order_list_item.shop_name = item.goodstag
      }
      order_list_item.total_amount = item.payamt
      order_list_item.create_time = item.paydate
      order_list_item.point = item.pointamt
      order_list_item.is_refund = item.returnflg
      order_list_item.invoiced = !item.invoiceflg
      order_list_item.invoicemsg = item.invoicemsg
      order_list_item.invoice_url = item.fpurl
      order_list.push(order_list_item)
    })
    return order_list
  }
  config = {
    navigationBarTitleText: '购物记录'
  }

  render() {
    const {
      order_list: order_list,
      account_id: account_id,
      loadStatus: loadStatus
    } = this.state
    return (
      <View className="page">
        <ScrollView>
          <OrderList orderList={order_list} accountId={account_id}></OrderList>
          {loadStatus === 'baseline' ? (
            <View className="order-nocontent">
              <View className="no-more-order">
                --------- 没有更多订单啦 ---------
              </View>
            </View>
          ) : (
            loadStatus === 'loading' && (
              <View className="weui-loadmore">
                <View className="weui-loading"></View>
                <View className="weui-loadmore__tips">正在加载</View>
              </View>
            )
          )}
        </ScrollView>
      </View>
    )
  }
}

export default _C
