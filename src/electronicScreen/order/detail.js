import {
  Block,
  View,
  Text,
  Button,
  Navigator,
  Image,
  Canvas
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import constant from '../../config/constant.js'
import util from '../../utils/util.js'
import onlineOrderUtil from '../../utils/onlineOrderUtil.js'
import QRcode from '../../component/QRcode/QRcode.js'
import orderProduct from '../../component/orderProduct/orderProduct.js'
import returnToHome from '../../component/returnToHome/returnToHome.js'

import ReturnToHomeTmpl from '../../imports/ReturnToHomeTmpl.js'
import QrcodeTmpl from '../../imports/QrcodeTmpl.js'
import OrderProductTmpl from '../../imports/OrderProductTmpl.js'
import LabelOrangeTmpl from '../../imports/LabelOrangeTmpl.js'
import OrderTraceTmpl from '../../imports/OrderTraceTmpl.js'
import OrderStatusTmpl from '../../imports/OrderStatusTmpl.js'
import './detail.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    orderDetail: {},
    proGift: [], // 所有的line，商品，加价购，赠品
    order: {},
    showDialog: false,
    showPickupPopup: false //是否展示提货弹窗（只有闪购需要）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.id = options.id
    this.data.orderType = options.type
    this.getOrderDetail(this.data.id, this.data.orderType)
    this.judgeAndShowReturnToHome(options)
  },

  /**
   * 获取订单详情
   */
  getOrderDetail: function(id, orderType) {
    let that = this

    util.requestLoginUrl({
      url: `${constant.orderLineDetail}${id}/`,
      success: function(data) {
        that.data.orderDetail = data
        let proGift = that.initialProducts(data.lines)
        let order_payments = Object.create(null)
        order_payments.list = data.order_payments
        let order_promotions = Object.create(null)
        order_promotions.list = data.order_promotions
        order_payments.discounts_money = data.total_coupons_discount

        order_promotions.discounts_money = data.total_promotions_discount

        let order = {
          shipping_method:
            data.shipping_method == 'express' ? '普通快递' : '自提',
          assignments: data.assignments,
          id: data.id,
          status: data.status,
          number: data.number,
          user_id: data.user_id,
          postage: data.postage,
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

        let { textUp, textDown } = that.createText(
          order.status,
          data.created_time,
          data.cash_total_amount
        )

        let status = {
          status: order.status,
          assignStatus: data.assign_status,
          // 配货状态
          shippingStatus: data.shipping_status, // 发货状态
          shippingMethod: data.shipping_method, // 自提还是快递
          textUp,
          textDown,
          orderType: orderType,
          isAssignmentPage: false,
          updatedTime: util.formatTimeString(data.updated_time)
        }

        status.statusText = onlineOrderUtil.translateOrderStatusText(
          order.status,
          data.aftersale_status
        )

        that.setData({
          proGift,
          order,
          status,
          order_payments,
          order_promotions
        })
      }
    })
  },

  /**
   * 根据status来生成textUp和textDown
   */
  createText: function(status, createTime, pay) {
    let obj = {
      textUp: '',
      textDown: ''
    }

    if (status == 'unpaid') {
      this.showCountDown(createTime, pay)
    }

    return obj
  },

  /**
   * 待付款显示倒计时
   */
  showCountDown: function(createTime, pay) {
    const _this = this
    this.data.timer = setInterval(() => {
      let status = this.data.status
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
   * 规范化商品列表
   */
  initialProducts: function(products) {
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
        sku_attr: product.sku_attr,
        retail_price: product.retail_price,
        original_price: product.original_price,
        quantity: product.quantity,
        productGiftId: product.product_id
      }

      if (product.is_fixed_price_product) {
        tempObj.promotion_type_name = '换购'
      }

      if (product.is_gift) {
        tempObj = {
          title: product.title,
          main_image: product.main_image,
          original_price: product.original_price,
          retail_price: product.retail_price,
          promotion_type_name: '赠品'
        }
      }
      productObj[product.brand_id].proGift.push(tempObj)
    })

    return productObj
  },

  /**
   *
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
    Taro.navigateTo({
      url: `/pages/usercenter/invoiceOpening/index?order_number=${order_number}&type=online`
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
   * 删除订单
   */
  handleDeleteOrder: function(e) {
    let that = this
    const id = e.target.dataset.id
    const { lineData } = this.data
    Taro.showModal({
      title: '提示',
      content: '您确定要删除订单么',
      success: res => {
        if (!res.cancel && res.confirm) {
          util.requestLoginUrl({
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
    const orderId = e.target.dataset.id
    const gotoUrl = util.returnCurrentPageUrlWithArgs()
    util.payOrder(orderId, gotoUrl)
  },

  /**
   * 点击复制订单编号
   */
  copyInvoiceUrl: function() {
    const url = this.data.order.invoice
    Taro.setClipboardData({
      data: url,
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
   * 订单内取消订单
   */
  detailHandleCancelOrder: function() {
    let _this = this
    const id = this.data.id

    Taro.showModal({
      title: '提示',
      content: '您确定要取消订单么',
      success: res => {
        if (!res.cancel && res.confirm) {
          util.requestLoginUrl({
            url: constant.orderLineCancel,
            data: {
              order_id: id
            },
            method: 'POST',
            success: data => {
              clearInterval(_this.data.timer)
              const id = _this.data.id
              const orderType = _this.data.orderType
              const newData = {
                id: id,
                orderDetail: {},
                proGift: [],
                order: {},
                showDialog: false,
                showPickupPopup: false
              }
              _this.data = {}
              _this.setData(newData, function() {
                _this.getOrderDetail(id, orderType)
              })
            }
          })
        } else {
        }
      }
    })
  }
}

const assignedObject = util.assignObject(
  pageData,
  QRcode,
  orderProduct,
  returnToHome
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '订单详情',
    enablePullDownRefresh: false
  }

  render() {
    const {
      status: status,
      express: express,
      orderType: orderType,
      proGift: proGift,
      order: order,
      order_promotions: order_promotions,
      order_payments: order_payments,
      pickupInfo: pickupInfo,
      showPickupPopup: showPickupPopup,
      showDialog: showDialog,
      showReturnToHome: showReturnToHome,
      imagePath: imagePath,
      QRpickupInfo: QRpickupInfo
    } = this.state
    return (
      <Block>
        <OrderStatusTmpl
          data={{
            status: (status, express)
          }}
        ></OrderStatusTmpl>
        {status.status != 'unpaid' && (
          <OrderTraceTmpl
            data={{
              status: (status, orderType)
            }}
          ></OrderTraceTmpl>
        )}
        <View className="mt20">
          <OrderProductTmpl
            data={{
              proGift: proGift
            }}
          ></OrderProductTmpl>
        </View>
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
            <View className="order-message-r">专柜自提</View>
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
        {/*  距离底部距离  */}
        <View className="message-padding-bottom"></View>
        {/*  闪购里面可以点击提货  */}
        {showPickupPopup && (
          <View className="mask-in" onClick={this.closePickupPopup}>
            <View className="pickup-popup">
              <I
                className="sparrow-icon icon-close"
                onClick={this.closePickupPopup}
              ></I>
              <I className="sparrow-icon icon-prepared"></I>
              <View className="pickup-hit1">请前往店内专柜提货</View>
              <View className="shop-view-out">
                <View className="pickup-location">{pickupInfo.location}</View>
                <View className="brand-name">{pickupInfo.brand}</View>
              </View>
              <View className="pickup-hit2">提货时请告知导购您下单手机号</View>
            </View>
          </View>
        )}
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
                  <View></View>
                  <I className="triangle-down triangle-position"></I>
                </View>
              )}
            </View>
            <View className="order-footer-btnbox">
              <Button className="order-footer1" onClick={this.handleMakePhone}>
                联系客服
              </Button>
            </View>
          </View>
        ) : (
          <View className="order-footer mt20">
            {order.status != 'to_pickup' && (
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
              {order.status == 'to_pickup' && (
                <Button
                  data-id={order.id}
                  className="order-footer1 red"
                  onClick={this.openQRCodePickupPopup}
                >
                  我要提货
                </Button>
              )}
              <Button className="order-footer1" onClick={this.handleMakePhone}>
                联系客服
              </Button>
              {order.status == 'completed' && order.invoice == '' && (
                <Button
                  className="order-footer1"
                  data-number={order.number}
                  onClick={this.clickInvoice}
                >
                  开立发票
                </Button>
              )}
            </View>
          </View>
        )}
        <ReturnToHomeTmpl
          data={{
            showReturnToHome: showReturnToHome
          }}
        ></ReturnToHomeTmpl>
        <QRcodeTmpl
          data={{
            imagePath: (imagePath, QRpickupInfo)
          }}
        ></QRcodeTmpl>
      </Block>
    )
  }
}

export default _C
