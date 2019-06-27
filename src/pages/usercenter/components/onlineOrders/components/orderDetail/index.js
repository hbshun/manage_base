import { Block, View, Image, Text, Button, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/onlineOrders/components/orderDetail/index.js
import constant from '../../../../../../config/constant.js'
import util from '../../../../../../utils/util.js'
import onlineOrderUtil from '../../../../../../utils/onlineOrderUtil.js'
import orderProduct from '../../../../../../component/orderProduct/orderProduct.js'
import returnToHome from '../../../../../../component/returnToHome/returnToHome.js'

import DialogModel from '../../../../../../component/dialogModel/index'
import ReturnToHomeTmpl from '../../../../../../imports/ReturnToHomeTmpl.js'
import OrderProductTmpl from '../../../../../../imports/OrderProductTmpl.js'
import LabelOrangeTmpl from '../../../../../../imports/LabelOrangeTmpl.js'
import OrderAddressTmpl from '../../../../../../imports/OrderAddressTmpl.js'
import OrderTraceTmpl from '../../../../../../imports/OrderTraceTmpl.js'
import OrderStatusTmpl from '../../../../../../imports/OrderStatusTmpl.js'
import './index.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    orderDetail: {},
    // address: {},
    proGift: [],
    order: {},
    showDialog: false,
    giftArr: [], // 订单的所有赠品
    showPickupPopup: false, //是否展示提货弹窗（只有闪购需要）
    status: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('oderDetail.options', options)
    this.setData({
      id: options.id
    })
    this.getOrderDetail(options.id, options.type)
    this.judgeAndShowReturnToHome(options)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.timer)
  },

  /**
   * 获取订单详情
   */
  getOrderDetail: function(id) {
    let _this = this
    util.request({
      url: `${constant.orderLineDetail}${id}/`,
      success: function(data) {
        // 赠品信息
        let giftArr = _this.formatGiftArr(data)
        // 地址信息
        let address = data.shipping_address
        // 商品数据
        let proGift = _this.formatProductData(data.lines)
        let order_payments = Object.create(null)
        order_payments.list = data.order_payments
        order_payments.discounts_money = data.total_coupons_discount
        let order_promotions = Object.create(null)
        order_promotions.list = data.order_promotions
        order_promotions.discounts_money = data.total_promotions_discount
        // 订单数据
        let order = _this.formatOrderData(data)
        // 订单状态信息
        let status = _this.formatOrderStatusData(data)
        _this.setData({
          address,
          proGift,
          order,
          status,
          order_payments,
          order_promotions,
          giftArr
        })
        console.log('orderDetail.address', _this.data.address)
        console.log('orderDetail.proGift', _this.data.proGift)
        console.log('orderDetail.order', _this.data.order)
        console.log('orderDetail.status', _this.data.status)
        console.log('orderDetail.order_payments', _this.data.order_payments)
        console.log('orderDetail.order_promotions', _this.data.order_promotions)
        console.log('orderDetail.giftArr', _this.data.giftArr)
      }
    })
  },

  /**
   * 格式化商品数据
   */
  formatProductData: function(products) {
    let productObj = {}
    products.forEach(product => {
      if (!productObj[product.brand_id]) {
        productObj[product.brand_id] = {
          brandName: product.brand.name,
          proGift: []
        }
      }
      let tempObj = {
        // promotion_type_name: constant.promotions[product.promotion_type_name],
        main_image: product.main_image,
        title: product.title,
        sku_attr:
          product.sku_attr.length > 20
            ? `${util.substring(product.sku_attr, 0, 20)}...`
            : product.sku_attr,
        retail_price: product.retail_price,
        original_price: product.original_price,
        quantity: product.quantity,
        productGiftId: product.product_id
      }
      if (product.is_fixed_price_product) {
        tempObj.promotion_type_name = '换购'
      }
      productObj[product.brand_id].proGift.push(tempObj)
    })
    return productObj
  },

  // 格式化订单赠品数据
  formatGiftArr: function(data) {
    let newData = []
    data.order_promotion_gifts.map((item, index) => {
      let newItem = {}
      newItem.main_image = item.main_image
      newItem.price = item.price
      newItem.title =
        item.brand && item.brand.name
          ? item.brand.name + item.title
          : item.title
      newData.push(newItem)
    })
    return newData
  },

  // 格式化订单数据
  formatOrderData: function(data) {
    let newData = {
      shipping_method: data.shipping_method == 'express' ? '普通快递' : '自提',
      assignments: data.assignments,
      id: data.id,
      status: data.status,
      aftersale_status: data.aftersale_status,
      number: data.number,
      user_id: data.user_id,
      postage: data.postage,
      cash_pay_amount: data.cash_pay_amount,
      cash_total_amount: data.cash_total_amount,
      total_amount: data.total_amount,
      actual_amount: data.actual_amount,
      created_time: util.formatTimeString(data.created_time),
      note: data.note,
      order_points: data.order_points,
      order_promotion_coupons: (() => {
        let coupons = ''
        data.order_promotion_coupons.forEach(coupon => {
          coupons += coupon.title
        })
        return coupons
      })(),
      invoice: (() => {
        let url = ''
        if (data.invoice && data.invoice.pdf_url) {
          url = data.invoice.pdf_url
        }
        return url
      })()
    }
    return newData
  },

  // 格式化订单状态数据
  formatOrderStatusData: function(data) {
    const _this = this
    let { textUp, textDown } = _this.createText(
      data.status,
      data.created_time,
      data.cash_total_amount
    )
    let newData = {
      status: data.status,
      aftersale_status: data.aftersale_status,
      assignStatus: data.assign_status, // 配货状态
      shippingStatus: data.shipping_status, // 发货状态
      shippingMethod: data.shipping_method, // 自提还是快递
      textUp,
      textDown,
      orderType: data.order_type,
      isAssignmentPage: false,
      updatedTime: util.formatTimeString(data.updated_time),
      statusText: onlineOrderUtil.translateOrderStatusText(
        data.status,
        data.aftersale_status
      )
    }
    return newData
  },

  /**
   * 根据status来生成textUp和textDown
   */
  createText: function(status, createTime, pay) {
    let obj = {
      textUp: '',
      textDown: ''
    }
    switch (status) {
      case 'unpaid':
        // 等待付款
        this.showCountDown(createTime, pay)
        break
    }
    return obj
  },

  /**
   * 待付款显示倒计时
   */
  showCountDown: function(createTime, pay) {
    const _this = this
    let { timer } = _this.data
    timer = setInterval(() => {
      let { status } = _this.data
      status.textUp = _this.orderClosedTime(createTime)
      status.textDown = '需支付：￥' + pay
      _this.setData({
        status
      })
    }, 500)
  },

  /**
   * 计算订单到期时间
   */
  orderClosedTime: function(createdDate) {
    const nowTime = new Date()
    const createdTime = new Date(createdDate + 'Z') // 后台返回的时间是中国区时间,一般newDate后单位会变成中国区时间,但是如果在小程序中单位会变成格林威治时间，为了消除差异，把返回时间强制变成格林威治时间（单位改变，但是数值不变），格林威治时间比中国时间要晚8小时
    const timeDifferent = new Date().getTimezoneOffset() // 当地时间与的格林威治时间差，单位：分
    const time = createdTime.getTime() + timeDifferent * 60 * 1000 // 转成当地时间
    const endTime = time + 2 * 60 * 60 * 1000 // 2小时之内完成支付
    if (endTime - nowTime.getTime() > 0) {
      const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000)
      const hour = util.formatNumber(Math.floor(differenceTime / 3600))
      const remainderMinute = differenceTime % 3600
      const minute = util.formatNumber(Math.floor(remainderMinute / 60))
      const remainderSecond = remainderMinute % 60
      const second = util.formatNumber(remainderSecond)
      return `剩余：${hour}小时${minute}分钟${second}秒`
    } else {
      clearInterval(this.data.timer)
      return `付款倒计时结束`
    }
  },

  /**
   * 订单内取消订单
   */
  detailHandleCancelOrder: function() {
    const _this = this
    const { id, timer } = _this.data
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
              clearInterval(timer)
              const newData = {
                id: id,
                orderDetail: {},
                proGift: [],
                order: {},
                showDialog: false,
                giftArr: [],
                showPickupPopup: false
              }
              _this.data = {}
              _this.setData(newData, function() {
                _this.getOrderDetail(id)
              })
            }
          })
        } else {
        }
      }
    })
  },

  /**
   * 打开提货窗口
   */
  openPickupPopup: function(e) {
    const _this = this
    const flashsaleProductId = _this.data.id
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
  },

  /**
   * 关掉提货窗口
   */
  closePickupPopup: function() {
    let pickupInfo = {
      location: '',
      brand: ''
    }
    this.setData({
      showPickupPopup: false,
      pickupInfo
    })
  },

  /**
   * 删除订单
   */
  handleDeleteOrder: function(e) {
    const _this = this
    const id = e.target.dataset.id
    const { lineData } = _this.data
    Taro.showModal({
      title: '提示',
      content: '您确定要删除订单么',
      success: res => {
        if (!res.cancel && res.confirm) {
          util.request({
            url: `${constant.orderLineDelete}${id}/`,
            method: 'DELETE',
            success: res => {
              Taro.navigateBack({
                delta: 1
              })
            }
          })
        } else {
        }
      }
    })
  },

  /**
   * 立即付款
   */
  handlePayMoney: function(e) {
    const order_id = e.target.dataset.id
    const gotoUrl =
      '/pages/usercenter/components/onlineOrders/components/orderDetail/index?id=' +
      order_id
    util.payOrder(order_id, gotoUrl)
  },

  /**
   * 点击进入配货单
   */
  redirectToAssignment: function(e) {
    const assignmentId = e.currentTarget.dataset.assignmentId
    Taro.navigateTo({
      url:
        '/pages/usercenter/components/onlineOrders/components/orderDetail/assignment/assignment?assignment_id=' +
        assignmentId
    })
  },

  /**
   * 显示/隐藏更多操作
   */
  handleShowDialog: function() {
    this.setData({
      showDialog: !this.data.showDialog
    })
  },

  /**
   * 联系客服
   */
  handleMakePhone: function() {
    Taro.makePhoneCall({
      phoneNumber: constant.SERVICE_PHONE
    })
  },

  /**
   * 点击复制电子发票地址
   */
  copyInvoiceUrl: function() {
    const { order } = this.data
    Taro.setClipboardData({
      data: order.invoice,
      success: function(res) {
        Taro.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  /**
   * 复制订单号
   */
  handleCopyOrderNumber: function(e) {
    Taro.setClipboardData({
      data: e.target.dataset.number,
      success: function(res) {
        Taro.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  /**
   * 点击开立发票
   */
  clickInvoice: function(e) {
    const order_number = e.currentTarget.dataset.number
    const aftersale_status = e.currentTarget.dataset.aftersale_status
    onlineOrderUtil.invoiceOnline(order_number, aftersale_status)
  }
}

const assignedObject = util.assignObject(pageData, orderProduct, returnToHome)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '订单详情',
    enablePullDownRefresh: false
  }

  render() {
    const {
      showReturnToHome: showReturnToHome,
      status: status,
      express: express,
      orderType: orderType,
      address: address,
      order: order,
      proGift: proGift,
      giftArr: giftArr,
      order_promotions: order_promotions,
      order_payments: order_payments,
      showPickupPopup: showPickupPopup,
      pickupInfo: pickupInfo,
      showDialog: showDialog
    } = this.state
    return (
      <Block>
        {/*  返回首页图标  */}
        <ReturnToHomeTmpl
          data={{
            showReturnToHome: showReturnToHome
          }}
        ></ReturnToHomeTmpl>
        {/*  订单状态  */}
        <OrderStatusTmpl
          data={{
            status: (status, express)
          }}
        ></OrderStatusTmpl>
        {/*  订单追踪  */}
        {status.status != 'unpaid' && (
          <OrderTraceTmpl
            data={{
              status: (status, orderType)
            }}
          ></OrderTraceTmpl>
        )}
        {/*  订单地址  */}
        {status.orderType != 'flashsale' &&
          status.shippingMethod != 'self_service' && (
            <OrderAddressTmpl
              data={{
                address: address
              }}
            ></OrderAddressTmpl>
          )}
        {order.assignments.length > 0 && (
          <View className="weui-cells weui-cells_after-title package-top">
            {order.assignments.map((item, index) => {
              return (
                <View
                  key={'redirect-assignment-' + index}
                  className="weui-cell into_package"
                  data-assignment-id={item.id}
                  onClick={this.redirectToAssignment}
                >
                  <View className="weui-cell__bd">
                    {'查看包裹' + (index + 1)}
                  </View>
                  <View className="weui-cell__ft weui-cell__ft_in-access"></View>
                </View>
              )
            })}
          </View>
        )}
        {/*  订单商品  */}
        <View className="mt20">
          <OrderProductTmpl
            data={{
              proGift: proGift
            }}
          ></OrderProductTmpl>
        </View>
        {giftArr.length > 0 && (
          <View className="mt20">
            <View className="order-product">
              <View className="counter-product">
                <View className="counter-name">赠品</View>
                {giftArr.map((item, index) => {
                  return (
                    <Block key={'gift-arr-' + index}>
                      <View className="product">
                        <View className="left-left">
                          <LabelOrangeTmpl
                            data={{
                              value: '赠品'
                            }}
                          ></LabelOrangeTmpl>
                        </View>
                        <View className="left">
                          <Image src={item.main_image}></Image>
                        </View>
                        <View className="gift-detail">
                          <View className="gift-h3">{item.title}</View>
                          <View className="gift-h4"></View>
                          <View className="gift-price">
                            <View className="price-new">
                              ￥<Text>0.00</Text>
                            </View>
                            {item.price - 0 > 0 && (
                              <View className="price-old">
                                赠品价值￥<Text>{item.price}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </Block>
                  )
                })}
              </View>
            </View>
          </View>
        )}
        <View className="order-money">
          <View className="order-money-total">
            <View className="weui-form-preview__hd">
              <View className="weui-form-preview__item">
                <View className="weui-form-preview__label">商品总额</View>
                <View className="weui-form-preview__value_in-hd">
                  {'¥' + order.total_amount}
                </View>
              </View>
            </View>
          </View>
          {/*  已减金额  */}
          {order_promotions.discounts_money > 0 && (
            <View className="weui-form-preview">
              <View
                className={
                  'weui-form-preview__hd ' +
                  (order_promotions.list.length <= 0 ? 'not-reduce-money' : '')
                }
              >
                <View className="weui-form-preview__item">
                  <View className="weui-form-preview__label">已减金额</View>
                  <View className="weui-form-preview__value_in-hd color-b31b1b">
                    {'-¥' + order_promotions.discounts_money}
                  </View>
                </View>
              </View>
              {order_promotions.list.length > 0 && (
                <View className="weui-form-preview__bd">
                  {item.discount_amount - 0 > 0 && (
                    <Block>
                      {order_promotions.list.map((item, index) => {
                        return (
                          <View
                            key={'order-promotions-' + item.id}
                            className="weui-form-preview__item"
                          >
                            <View className="weui-form-preview__label">
                              <Text className="color-b31b1b">{item.name}</Text>
                              {'：' + item.summary}
                            </View>
                            <View className="weui-form-preview__value">
                              {'-￥' + item.discount_amount}
                            </View>
                          </View>
                        )
                      })}
                    </Block>
                  )}
                </View>
              )}
            </View>
          )}
          {/*  使用优惠  */}
          {order_payments.discounts_money - 0 > 0 && (
            <View className="weui-form-preview">
              <View className="weui-form-preview__hd">
                <View className="weui-form-preview__item">
                  <View className="weui-form-preview__label">使用优惠</View>
                  <View className="weui-form-preview__value_in-hd color-b31b1b">
                    {'-¥' + order_payments.discounts_money}
                  </View>
                </View>
              </View>
              {order_payments.list.length > 0 && (
                <View className="weui-form-preview__bd">
                  {order_payments.list.map((item, index) => {
                    return (
                      <View
                        key={'order-payments-' + item.id}
                        className="weui-form-preview__item"
                      >
                        {item.payment_type == 13 ? (
                          <View className="weui-form-preview__label">C券</View>
                        ) : item.payment_type == 10 ? (
                          <View className="weui-form-preview__label">A券</View>
                        ) : (
                          item.payment_type == 16 && (
                            <View className="weui-form-preview__label">
                              {item.coupon ? item.coupon.title : '优惠券'}
                            </View>
                          )
                        )}
                        {(item.payment_type == 13 ||
                          item.payment_type == 10 ||
                          item.payment_type == 16) && (
                          <View className="weui-form-preview__value">
                            {'-￥' + item.amount}
                          </View>
                        )}
                      </View>
                    )
                  })}
                </View>
              )}
            </View>
          )}
          {/*  运费(自提不显示运费)  */}
          {order.shipping_method != '自提' && (
            <View className="weui-form-preview">
              <View className="weui-form-preview__hd order-money-freight">
                <View className="weui-form-preview__item">
                  <View className="weui-form-preview__label">
                    <Text>运费</Text>
                  </View>
                  <View className="weui-form-preview__value_in-hd color-b31b1b">
                    {'¥' + order.postage}
                  </View>
                </View>
              </View>
            </View>
          )}
          {/*  总计  */}
          <View className="weui-form-preview order-money-total-pay">
            <View>
              实付款：
              <Text className="color-b31b1b">
                {'￥' + order.cash_total_amount}
              </Text>
            </View>
            <View>{'获得积分：' + order.order_points}</View>
          </View>
        </View>
        {/*  订单信息  */}
        <View className="order-message color666 mt20">
          <View className="order-message-item">
            <View className="order-message-l">订单编号：</View>
            <View className="order-message-r">
              {order.number}
              <Button
                onClick={this.handleCopyOrderNumber}
                className="order-button-copy"
                type="default"
                data-number={order.number}
              >
                复制
              </Button>
            </View>
          </View>
          <View className="order-message-item">
            <View className="order-message-l">下单时间：</View>
            <View className="order-message-r">{order.created_time}</View>
          </View>
        </View>
        <View className="order-message color666">
          <View className="order-message-item">
            <View className="order-message-l">支付方式：</View>
            <View className="order-message-r">在线支付</View>
          </View>
          <View className="order-message-item">
            <View className="order-message-l">配送方式：</View>
            <View className="order-message-r">{order.shipping_method}</View>
          </View>
          <View className="order-message-item">
            <View className="order-message-l">发票信息：</View>
            {order.invoice ? (
              <View className="order-message-r">
                点击复制并在浏览器中打开
                <Button
                  onClick={this.copyInvoiceUrl}
                  className="order-button-copy"
                  type="default"
                >
                  复制
                </Button>
              </View>
            ) : (
              <View className="order-message-r">
                收货完成后可在订单页领取电子发票
              </View>
            )}
          </View>
        </View>
        {status.orderType != 'flashsale' && (
          <View className="order-message color666">
            <View className="order-message-item">
              <View className="order-message-l">买家留言：</View>
              <View className="order-message-r">
                {order.note ? order.note : ''}
              </View>
            </View>
          </View>
        )}
        {/*  距离底部距离  */}
        <View className="message-padding-bottom"></View>
        {/*  闪购里面可以点击提货  */}
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
        {/*  页脚  */}
        {order.status === 'unpaid' ? (
          <View className="order-footer mt20">
            <View className="order-footer-more">
              {showDialog && (
                <View className="order-footer-btn-dialog">
                  <View>
                    <View
                      className="order-footer-btn-dialog-item"
                      onClick={this.handleMakePhone}
                    >
                      联系客服
                    </View>
                  </View>
                  <View>
                    <View
                      className="order-footer-btn-dialog-item"
                      onClick={this.detailHandleCancelOrder}
                    >
                      取消订单
                    </View>
                  </View>
                  <I className="triangle-down triangle-position"></I>
                </View>
              )}
              <View
                className="order-footer-more-btn"
                onClick={this.handleShowDialog}
              >
                更多操作
              </View>
            </View>
            <View className="order-footer-message">
              <View>
                需支付：
                <Text className="color-b31b1b">
                  {'￥' + order.cash_total_amount}
                </Text>
              </View>
              <View>{'获得积分：' + order.order_points}</View>
            </View>
            {status.textUp != '付款倒计时结束' ? (
              <View
                className="order-footer-pay"
                data-id={order.id}
                onClick={this.handlePayMoney}
              >
                立即支付
              </View>
            ) : (
              <View
                className="order-footer-pay white"
                data-id={order.id}
              ></View>
            )}
          </View>
        ) : order.status === 'preparing' ? (
          <View className="order-footer mt20">
            <View className="order-footer-more">
              {showDialog && (
                <View className="order-footer-btn-dialog">
                  <View>
                    {/*  <view class='order-footer-btn-dialog-item' data-id="{{ order.id }}" bindtap='handleDeleteOrder'>删除订单</view>  */}
                  </View>
                  <I className="triangle-down triangle-position"></I>
                </View>
              )}
            </View>
            <View className="order-footer-btnbox">
              <Button className="order-footer1" onClick={this.handleMakePhone}>
                联系客服
              </Button>
              {/*  <button class='order-footer1'>申请退款</button>  */}
            </View>
          </View>
        ) : (
          <View className="order-footer mt20">
            {order.status !== 'to_pickup' && (
              <View className="order-footer-more">
                {showDialog && (
                  <View className="order-footer-btn-dialog">
                    <View>
                      <View
                        className="order-footer-btn-dialog-item"
                        data-id={order.id}
                        onClick={this.handleDeleteOrder}
                      >
                        删除订单
                      </View>
                    </View>
                    <I className="triangle-down triangle-position"></I>
                  </View>
                )}
                <View
                  className="order-footer-more-btn"
                  onClick={this.handleShowDialog}
                >
                  更多操作
                </View>
              </View>
            )}
            <View className="order-footer-btnbox">
              {status.orderType === 'flashsale' &&
                status.status === 'to_pickup' && (
                  <Button
                    className="order-footer1 red-border"
                    onClick={this.openPickupPopup}
                    onClick={this.clickPickUp}
                  >
                    <Text className="transparent-text">提</Text>提货
                    <Text className="transparent-text">货</Text>
                  </Button>
                )}
              <Button className="order-footer1" onClick={this.handleMakePhone}>
                联系客服
              </Button>
              {order.status === 'completed' &&
                order.invoice === '' &&
                order.cash_pay_amount > 0 && (
                  <Button
                    className="order-footer1"
                    data-number={order.number}
                    data-aftersale_status={order.aftersale_status}
                    onClick={this.clickInvoice}
                  >
                    开立发票
                  </Button>
                )}
            </View>
          </View>
        )}
      </Block>
    )
  }
}

export default _C
