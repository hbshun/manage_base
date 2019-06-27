import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/onlineOrders/components/orderList/components/orderCard/orderCard.js
import util from '../../../../../../../../utils/util.js'
import onlineOrderUtil from '../../../../../../../../utils/onlineOrderUtil.js'
import constant from '../../../../../../../../config/constant.js'
import DialogModel from '../../../../../../../../component/dialogModel/index'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    orderData: []
  }
  _observeProps = []
  state = {
    orderData: [],
    pickupInfo: {},
    showPickupPopup: false
  }
  lifetimes = {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.setData({
        orderData: this.properties.orderData
      })
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    }
  }
  attached = () => {
    // 在组件实例进入页面节点树时执行
    this.setData({
      orderData: this.properties.orderData
    })
  }
  detached = () => {
    // 在组件实例被从页面节点树移除时执行
  }
  clickToOrderDetail = e => {
    const url = e.currentTarget.dataset.url
    Taro.navigateTo({
      url: url
    })
  }
  reloadOrderList = status => {
    console.log('status', status)
    var myEventDetail = {
      status: status // detail对象，提供给事件监听函数
    }
    var myEventOption = {} // 触发事件的选项
    this.triggerEvent('reloadOrderList', myEventDetail, myEventOption)
  }
  deleteAllOrder = e => {
    let _this = this
    const id = e.target.dataset.id
    const status = e.target.dataset.status
    const { orderData } = _this.data
    Taro.showModal({
      title: '提示',
      content: '订单删除之后无法恢复，您确定要删除订单么',
      success: res => {
        if (!res.cancel && res.confirm) {
          util.request({
            url: `${constant.orderLineDelete}${id}/`,
            method: 'DELETE',
            success: res => {
              // 删除成功后，在列表中移除
              for (let i = 0, len = orderData.length; i < len; i++) {
                if (id === orderData[i].id) {
                  orderData.splice(i, 1)
                  break
                }
              }
              Taro.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
              _this.setData({
                orderData
              })
              _this.reloadOrderList(status)
            }
          })
        } else {
        }
      }
    })
  }
  handlePayOrder = e => {
    const order_id = e.target.dataset.id
    const orderType = e.target.dataset.type
    let gotoUrl = '/pages/usercenter/order/detail/detail?id=' + order_id
    if (orderType && orderType == 'vending') {
      Taro.navigateTo({
        url: '/vendingMachine/order/detail?id=' + order_id + '&type=vending'
      })
    } else if (orderType && orderType == 'screen') {
      Taro.navigateTo({
        url: '/electronicScreen/order/detail?id=' + order_id + '&type=screen'
      })
    }
    util.payOrder(order_id, gotoUrl)
  }
  clickInvoice = e => {
    const order_number = e.currentTarget.dataset.number
    const aftersale_status = e.currentTarget.dataset.aftersale_status
    onlineOrderUtil.invoiceOnline(order_number, aftersale_status)
  }
  navigateToInvoiceInfo = e => {
    let invoice_url = encodeURIComponent(e.currentTarget.dataset.invoice_url)
    Taro.navigateTo({
      url: `/pages/usercenter/InvoiceInfo/index?invoice_url=${invoice_url}`
    })
  }
  cancelAllOrder = e => {
    let _this = this
    const id = e.target.dataset.id
    const status = e.target.dataset.status
    const { orderData } = _this.data

    Taro.showModal({
      title: '提示',
      content: '您确定要取消订单么',
      success: res => {
        if (!res.cancel && res.confirm) {
          util.request({
            url: constant.orderLineCancel,
            data: {
              order_id: id
            },
            method: 'POST',
            success: data => {
              let order
              // 取消成功，设置取消状态
              for (let i = 0, len = orderData.length; i < len; i++) {
                order = orderData[i]
                if (id === order.id) {
                  order.statusClass = _this.getOrderStatusClass(data.status)
                  order.status = data.status
                  order.statusText = onlineOrderUtil.translateOrderStatusText(
                    data.status,
                    data.aftersale_status
                  )
                }
              }
              Taro.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 2000
              })
              _this.setData({
                orderData
              })
              _this.reloadOrderList(status)
            }
          })
        } else {
        }
      }
    })
  }
  clickPickUp = e => {}
  getOrderStatusClass = status => {
    let statusClass = 'order-header-status-goods'
    switch (status) {
      case 'unpaid':
        statusClass = 'order-header-status-pay'
        break
      case 'closed':
        statusClass = 'order-header-status-cancel'
        break
    }
    return statusClass
  }
  openPickupPopup = e => {
    console.log(e)
    let flashsaleProductId = e.currentTarget.dataset.id
    const _this = this
    const data = {
      order_id: flashsaleProductId
    }
    let pickupInfo = {}
    util.request({
      url: constant.flashsaleInfo,
      method: 'POST',
      data: data,
      success: function(res) {
        pickupInfo.location = '汉光百货 ' + res.floor.name + ' ' + res.location
        pickupInfo.brand = res.name + ' 专柜'
        _this.setData({
          pickupInfo,
          showPickupPopup: true
        })
      }
    })
  }
  closePickupPopup = () => {
    let pickupInfo = {
      location: '',
      brand: ''
    }
    this.setData({
      showPickupPopup: false,
      pickupInfo
    })
  }
  config = {
    component: true
  }

  render() {
    const { orderData: orderData } = this.props
    const {
      tem: tem,
      showPickupPopup: showPickupPopup,
      pickupInfo: pickupInfo
    } = this.state
    return orderData.map((item, index) => {
      return (
        <View key={'order-' + index}>
          <View className="order-card">
            <View className="order-header">
              <View className="shop-name">
                <I className="sparrow-icon icon-shop"></I>
                <Text className="shop-name-text">{item.brands}</Text>
              </View>
              {item.status === 'unpaid' ? (
                <View className="order-status order-header-status-pay">
                  {item.statusText}
                </View>
              ) : item.status === 'closed' ? (
                <View className="order-status order-header-status-cancel">
                  {item.statusText}
                </View>
              ) : (
                <View className="order-status">{item.statusText}</View>
              )}
            </View>
            <View
              className="products"
              data-url={item.url}
              onClick={this.clickToOrderDetail}
            >
              {item.images.length > 1 ? (
                <View className="order-line-content clearfix">
                  {item.images.map((image, idx) => {
                    return (
                      <Image
                        key={'order-line-image-' + idx}
                        src={image}
                        alt
                      ></Image>
                    )
                  })}
                </View>
              ) : (
                <View className="order-line-content clearfix">
                  <Image src={item.images[0]} alt></Image>
                  <View className="order-content-msg">
                    <View>{item.title}</View>
                  </View>
                </View>
              )}
            </View>
            <View className="product-statistics">
              {'共' + item.products_count + '件商品 实付款:'}
              <Text className="cash_total_amount">
                {'￥ ' + item.cash_total_amount}
              </Text>
            </View>
            <View className="order-footer">
              <View className="delete-order">
                {(item.status === 'completed' || item.status === 'closed') && (
                  <Text
                    className="delete-order-button"
                    onClick={this.deleteAllOrder}
                    data-id={item.id}
                    data-status={item.status}
                  >
                    删除订单
                  </Text>
                )}
              </View>
              <View className="order-operation">
                {item.status === 'unpaid' && (
                  <View
                    onClick={this.handlePayOrder}
                    data-id={item.id}
                    data-status={item.status}
                    data-type={tem.orderType}
                    className="order-operation-pay"
                  >
                    立即支付
                  </View>
                )}
                {item.status === 'unpaid' && (
                  <View
                    onClick={this.cancelAllOrder}
                    data-id={item.id}
                    data-status={item.status}
                    className="order-operation-cancle"
                  >
                    取消订单
                  </View>
                )}
                {/*  订单状态为完成，没有开过发票，没有售后，显示开立发票按钮  */}
                {item.status === 'completed' &&
                  !item.invoice &&
                  item.cash_pay_amount > 0 && (
                    <View
                      onClick={this.clickInvoice}
                      data-number={item.number}
                      data-aftersale_status={item.aftersale_status}
                      className="order-operation-cancle"
                    >
                      开立发票
                    </View>
                  )}
                {/*  订单状态为完成，已经开立发票，没有售后，显示查看发票按钮  */}
                {item.status === 'completed' &&
                  item.invoice &&
                  item.aftersale_status === 'none' &&
                  item.cash_pay_amount > 0 && (
                    <View
                      onClick={this.navigateToInvoiceInfo}
                      data-invoice_url={item.invoice_url}
                      className="order-operation-cancle"
                    >
                      查看发票
                    </View>
                  )}
                {/*  订单类型为闪购订单，状态为可提货，没有售后情况下显示提货按钮  */}
                {item.orderType === 'flashsale' &&
                  item.status === 'to_pickup' &&
                  item.aftersale_status === 'none' && (
                    <View
                      onClick={this.openPickupPopup}
                      data-id={item.id}
                      data-type={tem.orderType}
                      className="order-operation-pay"
                    >
                      提货
                    </View>
                  )}
                {/*  订单类型为互动屏订单，订单状态为可退货，没有售后情况下显示提货按钮  */}
                {/*  <view wx:if="{{item.orderType === 'screen' && item.status === 'to_pickup' && item.aftersale_status === 'none' }}" bindtap='clickPickUp' catchtap='openQRCodePickupPopup' data-id="{{ item.id }}" data-type="{{tem.orderType}}"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 class='order-operation-pay'>提货</view>  */}
              </View>
            </View>
            {/*  闪购提货弹窗提示  */}
            <DialogModel
              onMyevent={this.closePickupPopup}
              showDialogService={showPickupPopup}
            >
              <View className="content">
                <View className="pickup-info">
                  <View className="header">请前往店内专柜提货</View>
                  <View className="content-info">
                    <View className="pick-location">{pickupInfo.location}</View>
                    <View className="pick-brand">{pickupInfo.brand}</View>
                  </View>
                  <View className="footer">提货时请告知导购您的下单手机号</View>
                </View>
                <View
                  className="grid-icon sparrow-icon icon-popup-no icon"
                  onClick={this.closePickupPopup}
                ></View>
              </View>
            </DialogModel>
          </View>
        </View>
      )
    })
  }
}

export default _C
