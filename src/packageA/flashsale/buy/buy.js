import { Block, View, Image, Input, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import floatObj from '../../../common/js/floatObj.js'
import GIO_utils from '../../../utils/GIO_utils.js'

import OrderFooterTmpl from '../../../imports/OrderFooterTmpl.js'
import LabelOrangeTmpl from '../../../imports/LabelOrangeTmpl.js'
import LabelRedTmpl from '../../../imports/LabelRedTmpl.js'
import './buy.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    id: 0,
    points: 0, // 使用的积分
    gainPoints: 0, // 获得的积分
    maxPoints: 0, // 积分最大值
    money: 0, // 支付金额
    retailPrice: 0, // 支付金额取整
    name: '',
    phone: '',
    orderInfo: null,
    address: ''
  }
  orderId = 0
  orderType = ''
  productInfoForGIO = []
  orderInfoForGIO = {}
  componentWillMount = (options = this.$router.params || {}) => {
    const id = options.id
    this.data.id = id
    this.getOrderInfo(id)
    util.printLog('wechat_app', 'go_to_bill', '')
  }
  getOrderInfo = id => {
    let that = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: `${constant.flashSaleOrder}?flashsaleproduct_id=${id}`,
      success: data => {
        // 设置最大可用积分
        let maxPoints
        let retail_price = Math.floor(data.product.retail_price)
        if (data.c_coupon <= retail_price) {
          maxPoints = data.c_coupon
        } else {
          maxPoints = retail_price
        }
        // that.data.retailPrice = that.data.money = retail_price;
        // 提货地址
        let shop = data.product.shop
        let address = shop.floor.name + shop.location + shop.name
        const { point_base, point_multiple } = data.points_param

        that.setData({
          name: data.user.name,
          phone: data.user.phone,
          orderInfo: data,
          maxPoints,
          address,
          retailPrice: retail_price,
          money: data.product.retail_price,
          gainPoints: that.getGainPoints(
            data.product.retail_price,
            point_base,
            point_multiple
          )
        })

        Taro.hideToast()
      }
    })
  }
  placeAnOrder = () => {
    let _this = this
    let orderData = Object.create(null)

    orderData.flashsaleproduct_id = this.data.id
    orderData.c_coupon = this.data.points
    orderData.name = this.data.name.trim()
    orderData.phone = this.data.phone

    if (util.isEmpty(orderData.name)) {
      util.showModalError('请输入姓名')
      return
    }

    if (util.isEmpty(orderData.phone)) {
      util.showModalError('请输入手机号码')
      return
    }

    if (!util.isPhone(orderData.phone)) {
      util.showModalError('请输入正确的手机号码')
      return
    }

    util.request({
      url: constant.flashSaleOrder,
      method: 'POST',
      data: orderData,
      success: data => {
        // 支付
        _this.orderId = data.id
        _this.orderType = data.order_type
        _this.handle_product_for_GIO()
        _this.handle_order_for_GIO()
        _this.getWxappPayConfig(data.id)

        const orderObj = _this.get_order_obj('createOrder', 'checkOut')
        GIO_utils.send_GIO_after_pay_success(orderObj)

        // 正常流程付款不需要发送paySKUOrder和payOrder给GIO
        // const payObj = _this.get_order_obj('paySKUOrder', 'payOrder');
        // GIO_utils.send_GIO_after_pay_success(payObj);
      }
    })
  }
  handle_product_for_GIO = () => {
    const product = this.data.orderInfo.product
    const productId_var = product.id || ''
    const productMainName_var =
      product.brand.name + ' ' + product.product_main.title
    const brandName_var = product.brand.name || ''
    const productSkuAttr_var = product.sku_attr || ''
    const productCartNumber_var = this.data.orderInfo.quantity || ''
    const skuDep_var = product.shop.name || ''
    const skuFloor_var = product.shop.floor.name || ''
    const campaignName_var = ''
    const campaignType_var = ''
    const orderId_var = this.orderId
    const orderType_var = GIO_utils.return_order_type(this.orderType)
    const retailPrice_var = product.retail_price || ''
    const productMainId_var = product.product_main.id || ''

    const obj = {
      productId_var,
      productMainName_var,
      brandName_var,
      productSkuAttr_var,
      productCartNumber_var,
      skuDep_var,
      skuFloor_var,
      campaignName_var,
      campaignType_var,
      orderId_var,
      orderType_var,
      retailPrice_var,
      productMainId_var
    }

    this.productInfoForGIO.push(obj)
  }
  handle_order_for_GIO = () => {
    const product = this.data.orderInfo.product
    const productCartNumber_var = this.data.orderInfo.quantity // 这里包括赠品数量
    const orderId_var = this.orderId
    const orderType_var = GIO_utils.return_order_type(this.orderType)
    const ifCouponUsed_var = '否'
    const couponType_var = ''
    const couponName_var = ''
    const ifFreeShipping_var = '否'
    const payAmount_var = parseFloat(this.data.money)

    this.orderInfoForGIO = {
      productCartNumber_var,
      orderId_var,
      orderType_var,
      ifCouponUsed_var,
      couponType_var,
      couponName_var,
      ifFreeShipping_var,
      payAmount_var
    }
  }
  get_order_obj = (product_event, order_event) => {
    const { productInfoForGIO, orderInfoForGIO } = this

    const orderObj = {
      productInfoForGIO,
      orderInfoForGIO,
      productEvent: product_event,
      orderEvent: order_event
    }

    return orderObj
  }
  getWxappPayConfig = orderId => {
    const gotoUrl =
      '/pages/usercenter/components/onlineOrders/components/orderDetail/index?id=' +
      orderId +
      '&type=flashsale'
    const orderObj = this.get_order_obj('paySKUSuccess', 'payOrderSuccess')
    const func = GIO_utils.send_GIO_after_pay_success
    util.payOrder(orderId, gotoUrl, func, orderObj)
  }
  handleWechatPay = () => {
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 30000
    })

    this.placeAnOrder()
  }
  getGainPoints = (money, point_base, point_multiple) => {
    // money * point_multiple / point_base
    const result1 = floatObj.multiply(money, point_multiple)
    const result2 = floatObj.divide(result1, point_base)
    return Math.floor(result2)
  }
  handleNavigateBack = () => {
    Taro.navigateBack()
  }
  handleNameChange = e => {
    this.data.name = e.detail.value
  }
  handlePhoneChange = e => {
    this.data.phone = e.detail.value
  }
  config = {
    navigationBarTitleText: '闪购订单',
    enablePullDownRefresh: false
  }

  render() {
    const {
      orderInfo: orderInfo,
      maxPoints: maxPoints,
      name: name,
      phone: phone,
      address: address,
      money: money,
      gainPoints: gainPoints
    } = this.state
    return (
      <View className="order-page">
        <View className="product-section">
          <View className="order-product">
            <View className="counter-product">
              <View className="counter-name">
                <I className="sparrow-icon icon-shop"></I>
                {orderInfo.product.brand.name}
              </View>
              <View className="product">
                <View className="left">
                  <Image src={orderInfo.product.main_image}></Image>
                </View>
                <View className="center">
                  <View className="product-name">
                    {orderInfo.product.product_main.title}
                  </View>
                  <View className="product-type">
                    {orderInfo.product.sku_attr}
                  </View>
                </View>
                <View className="right">
                  <View className="new-price">
                    {orderInfo.product.retail_price}
                  </View>
                  {orderInfo.product.original_price -
                    orderInfo.product.retail_price >
                    0 && (
                    <View className="old-price">
                      {orderInfo.product.original_price}
                    </View>
                  )}
                  <View className="number">{orderInfo.quantity}</View>
                </View>
              </View>
            </View>
          </View>
          {/*  <view class="show-all-product">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <view class="text" bindtap="showAllMerchandise">全部1件商品</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <view class="inital-pay">￥54.00</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </view>  */}
        </View>
        {/*  <view class="all-active">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <view class="active-item">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <view class="item" style='padding: 0 15px 0 0; height: 26px;'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <view class="left font-12" style='height: 26px; line-height: 26px;'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                积分抵扣
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <view class="right">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <input type="number" placeholder='请输入积分' class='order-input-integral' />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </view>  */}
        <View className="weui-cells weui-cells_after-title mt30">
          {maxPoints - 0 > 0 && (
            <View className="weui-cell weui-cell_input">
              <View className="weui-cell__hd">
                <View className="weui-label">C券抵扣</View>
              </View>
              <View className="weui-cell__bd">
                <Input
                  onInput={this.handlePointChange}
                  type="number"
                  className="weui-input"
                  placeholder={'最大用' + maxPoints + '元'}
                ></Input>
              </View>
            </View>
          )}
          <View className="weui-cell weui-cell_input">
            <View className="weui-cell__hd">
              <View className="weui-label">姓名</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                onInput={this.handleNameChange}
                value={name}
                className="weui-input"
                placeholder="请输入姓名"
              ></Input>
            </View>
          </View>
          <View className="weui-cell weui-cell_input weui-cell_vcode">
            <View className="weui-cell__hd">
              <View className="weui-label">手机号</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                onInput={this.handlePhoneChange}
                type="number"
                className="weui-input"
                maxlength="11"
                value={phone}
                placeholder="请输入手机号"
              ></Input>
            </View>
          </View>
        </View>
        {/*  <view class="shipments">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 <view class="choose-shipments">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   <view class="left">配送方式</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   <view class="right">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     <view class="help-youself">到{{ address }}专柜自提</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 <view class="invoice-text">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   <view class="left">发票信息</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   <view class="right">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     <view class="text1">发票实买实开</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     <view class="text2">在支付完成的订单内选择生成电子发票</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               </view>  */}
        <View className="weui-cells mt30">
          <View className="weui-cell">
            <View className="weui-cell__hd">
              <View className="weui-label">配送方式</View>
            </View>
            <View className="weui-cell__bd color-b31b1b textRight">
              {'到' + address + '专柜自提'}
            </View>
          </View>
          <View className="weui-cell">
            <View className="weui-cell__hd">
              <View className="weui-label">发票信息</View>
            </View>
            <View className="weui-cell__bd">
              <View className="color666 textRight">发票实买实开</View>
              <View className="color666 textRight">
                在支付完成的订单内选择生成电子发票
              </View>
            </View>
          </View>
        </View>
        {/*  <view class="leave-a-message">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         <view class="left">买家留言</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         <view class="right">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           <textarea class="input-note" bindinput="inputNotes" value="" placeholder='请输入留言信息' />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       </view>  */}
        <View className="order-pay">
          <View className="pay-money">
            <Text className="text1">合计金额：</Text>
            <Text className="text2">{'￥' + money}</Text>
          </View>
          <View className="get-point">{'获得积分：' + gainPoints}</View>
          <View>
            <Button
              className="wx-pay"
              type="primary"
              onClick={this.handleWechatPay}
            >
              微信安全支付
            </Button>
            {/*  <button class="other-pay"> 其他方式支付 </button>   */}
          </View>
          <View className="return-btn">
            <I
              className="sparrow-icon icon-arrows-left"
              onClick={this.turnToCart}
            ></I>
            <Text onClick={this.handleNavigateBack}>返回</Text>
          </View>
        </View>
        <OrderFooterTmpl></OrderFooterTmpl>
      </View>
    )
  }
}

export default _C
