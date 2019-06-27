import { Block, View, Image, Input, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import floatObj from '../../common/js/floatObj.js'

import OrderFooterTmpl from '../../imports/OrderFooterTmpl.js'
import './buy.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    id: 0,
    maxCCoupon: 0, // 最大可用C券
    useCCoupon: '', // 使用的C券
    money: 0, // 支付金额
    retailPrice: 0, // 订单金额
    orderInfo: null,
    gainPoints: 0, // 用户获得的积分
    point_base: 3,
    point_multiple: 1
  }
  componentWillMount = (options = this.$router.params || {}) => {
    // 解析扫码进入的参数
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    this.options = options
    this.data.id = options.product_id
    this.getOrderInfo(options)
    util.printLog('wechat_app', 'vending-machine', '')
  }
  getOrderInfo = options => {
    let that = this
    const { order_id, product_id, app_id, timestamp, nonce, sign } = options

    let productUrl = `${constant.vendingMachineCart}?order_id=${order_id}&product_id=${product_id}&app_id=${app_id}&timestamp=${timestamp}&nonce=${nonce}&sign=${sign}`

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.requestLoginUrl({
      url: productUrl,
      success: data => {
        // 最大可用C券
        let maxCCoupon = 0
        // 订单金额
        let retail_price = Math.floor(parseFloat(data.product.retail_price))
        // 设置最大可用C券
        if (data.c_coupon <= retail_price) {
          maxCCoupon = data.c_coupon
        } else {
          maxCCoupon = retail_price
        }

        const { point_base, point_multiple } = data.points_param

        that.setData({
          point_base,
          point_multiple,
          orderInfo: data,
          maxCCoupon,
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
    let options = this.options
    // if (!options.product_id) {
    //   return;
    // }
    const { useCCoupon } = this.data

    let that = this
    util.requestLoginUrl({
      url: constant.vendingMachineCart,
      method: 'POST',
      data: {
        ...options,
        c_coupon: useCCoupon === '' ? 0 : useCCoupon
      },
      success: data => {
        // 支付
        that.getWxappPayConfig(data.id)
      }
    })
  }
  getWxappPayConfig = orderId => {
    const gotoUrl = `/vendingMachine/order/detail?id=${orderId}&type=vending&from_share=1`
    util.payOrder(orderId, gotoUrl)

    // util.requestLoginUrl({
    //   url: constant.postOrder,
    //   method: 'POST',
    //   data: {
    //     order_id: orderId,
    //   },
    //   success: (data) => {
    //     if (data.code == 1) {

    //       wx.redirectTo({
    //         url: `/vendingMachine/order/detail?id=${orderId}&type=vending`,
    //       });
    //     } else {

    //       // 支付
    //       util.wxappPayment(data, orderId, '/vendingMachine/order/detail');
    //     }
    //   },

    // });
  }
  handleWechatPay = () => {
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 30000
    })

    this.placeAnOrder()
  }
  handleCCouponChange = e => {
    // 输入框的值
    let couponValue = e.detail.value.trim()
    // 用户使用的C券
    let currentCoupon

    // couponValue 值不为空，且是数字时。否则赋值0
    if (
      !util.isEmpty(couponValue) &&
      parseFloat(couponValue).toString !== 'NaN'
    ) {
      currentCoupon = parseFloat(couponValue)
    } else {
      currentCoupon = 0
    }

    const {
      point_base,
      point_multiple,
      money,
      retailPrice,
      maxCCoupon,
      useCCoupon
    } = this.data

    // 使用的C券不能超过最大使用值
    currentCoupon = currentCoupon >= maxCCoupon ? maxCCoupon : currentCoupon
    // 用户支付的现金
    let currentMoney = floatObj.subtract(retailPrice, currentCoupon)
    // 用户获得的积分
    let currentPoints = this.getGainPoints(
      currentMoney,
      point_base,
      point_multiple
    )
    this.setData({
      useCCoupon: currentCoupon === 0 ? '' : currentCoupon,
      money: floatObj.toDecimal(currentMoney, 2),
      gainPoints: currentPoints
    })
    console.log(currentCoupon, currentMoney, retailPrice)
  }
  getGainPoints = (money, point_base, point_multiple) => {
    // money * point_multiple / point_base
    const result1 = floatObj.multiply(money, point_multiple)
    const result2 = floatObj.divide(result1, point_base)
    return Math.floor(result2)
  }
  handleGotoUserCenter = () => {
    Taro.switchTab({
      url: '/pages/usercenter/index/index'
    })
  }
  config = {
    navigationBarTitleText: '售货机订单',
    enablePullDownRefresh: false
  }

  render() {
    const {
      orderInfo: orderInfo,
      maxCCoupon: maxCCoupon,
      useCCoupon: useCCoupon,
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
        </View>
        {/*  C券抵扣  wx:if="{{ maxCCoupon > 0 }}"  */}
        <View className="weui-cells weui-cells_after-title mt30">
          <View className="weui-cell weui-cell_input">
            <View className="weui-cell__hd">
              <View className="weui-label">C券抵扣</View>
            </View>
            <View className="weui-cell__bd">
              <Input
                onInput={this.handleCCouponChange}
                type="number"
                className="weui-input"
                placeholder={'最大可用' + maxCCoupon}
                value={useCCoupon}
              ></Input>
            </View>
          </View>
        </View>
        <View className="weui-cells mt30">
          <View className="weui-cell">
            <View className="weui-cell__hd">
              <Text>配送方式</Text>
            </View>
            <View className="weui-cell__bd color-b31b1b textRight">
              售货机自提
            </View>
          </View>
          <View className="weui-cell">
            <View className="weui-cell__hd">
              <Text>发票信息</Text>
            </View>
            <View className="weui-cell__bd">
              <View className="color666 textRight">发票实买实开</View>
              <View className="color666 textRight">
                在支付完成的订单内选择生成电子发票
              </View>
            </View>
          </View>
        </View>
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
          </View>
          <View className="return-btn">
            <I
              className="sparrow-icon icon-arrows-left"
              onClick={this.turnToCart}
            ></I>
            <Text onClick={this.handleGotoUserCenter}>个人中心</Text>
          </View>
        </View>
        <OrderFooterTmpl></OrderFooterTmpl>
      </View>
    )
  }
}

export default _C
