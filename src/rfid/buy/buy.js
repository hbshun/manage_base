import { Block, View, Text, Button, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'

import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import chooseDiscounts from './popup/chooseDiscounts/chooseDiscounts.js'
import returnToHome from '../../component/returnToHome/returnToHome.js'
import qs from '../../utils/qs/index.js'

import ReturnToHomeTmpl from '../../imports/ReturnToHomeTmpl.js'
import ChooseDiscountsTmpl from '../../imports/ChooseDiscountsTmpl.js'
import OrderProductTmpl from '../../imports/OrderProductTmpl.js'
import LabelRedTmpl from '../../imports/LabelRedTmpl.js'
import './buy.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    show: {
      // 弹出层的显示
      chooseDiscounts: false
    },
    allReduced: 0, // 总共的已减金额
    reducedAmount: [], // 具体的已减金额
    allProGiftList: [], // 展示所有的商品信息
    shipping: [], // 加载所有快递信息，传递给弹框（单独向后台获取的数据）
    coupons: {}, // 优惠券积分等信息
    showCoupons: {}, // 在优惠弹框中展示的数据，初始时和coupons一样，后期因为用户更改弹框内的优惠信息，但是又没有确定而不一样，
    productsText: '', // 扫码得出的购买商品信息
    orderDataObj: {
      products: '',
      order_id: 0
      // c_coupon: 0,
      // gift_coupons: '3485,430953',
    }, // 向后台post的数据
    url: '' // 传给后台的地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    util.printLog('wechat_app', 'screen', '')

    // 解析扫码进入的参数
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    const url = util.returnUrl(options)

    this.judgeAndShowReturnToHome(options)
    this.data.orderDataObj.products = options.products || ''
    this.data.orderDataObj.order_id = options.order_id
    this.data.url = url
    this.getOrderInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 获取订单信息
   */
  getOrderInfo: function() {
    const url = this.data.url
    const that = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 10000
    })

    util.requestLoginUrl({
      url: constant.getRfidOrderInfo + url,
      method: 'GET',
      success: function(data) {
        that.handleOrderInfo(data)
        Taro.hideToast()
      },
      fail: function(err) {}
    })
  },

  /**
   * 处理后台返回的订单信息
   */
  handleOrderInfo: function(data) {
    const allReduced = data.total_discount_price
    const reducedAmount = this.caculateReducedAmount(data.brands, data.hg)
    const returnObj = this.turnToProGiftList(data.brands)
    const allProGiftList = returnObj.allProGiftList
    const coupons = data.coupons
    const showCoupons = data.coupons
    const shipping = data.shipping.shipping_method
    const otherInfo = {}

    // coupons.pointsMoney = Math.floor(coupons.selected_points / 100);
    // coupons.discounts = coupons.total_amount;
    otherInfo.actual_amount = data.actual_amount
    otherInfo.total_actual_amount = data.total_actual_amount // 含邮费
    otherInfo.shipping_type = data.shipping.shipping_type
    otherInfo.postage = data.shipping.postage
    otherInfo.total_points = data.total_points

    this.setData({
      otherInfo,
      allReduced,
      reducedAmount,
      allProGiftList,
      coupons,
      showCoupons,
      shipping
    })
  },

  /**
   * 计算已减金额(全场活动加品牌活动)
   */
  caculateReducedAmount: function(brands, hg) {
    let allReduced = []

    // 专柜活动
    for (let i = 0; i < brands.length; i++) {
      for (let j = 0; j < brands[i].promotions.length; j++) {
        const promotion = brands[i].promotions[j]
        let obj = {}
        obj.span = promotion.promotion_type.name
        obj.name = promotion.title
        obj.amount = promotion.discount_amount
        allReduced.push(obj)
      }
    }

    // 全场活动
    for (let i = 0; i < hg.promotions.length; i++) {
      const promotion = hg.promotions[i]
      let obj = {}
      obj.span = promotion.promotion_type.name
      obj.name = promotion.title
      obj.amount = promotion.discount_amount
      allReduced.push(obj)
    }

    return allReduced
  },

  /**
   * 转换成商品列表数据
   */
  turnToProGiftList: function(brands) {
    let returnObj = {}
    returnObj.allProGiftList = []

    for (let i = 0; i < brands.length; i++) {
      let brandItem = {}
      brandItem.brandName = brands[i].name
      brandItem.proGift = [] // 在该品牌下的商品和加价购、买赠商品

      // 商品
      for (let j = 0; j < brands[i].products.length; j++) {
        const item = brands[i].products[j]
        let product = {}

        product.title = item.title
        product.main_image = item.main_image
        product.original_price = item.original_price
        product.sku_attr = item.sku_attr
        product.quantity = item.quantity
        product.retail_price = item.retail_price
        product.productGiftId = item.id

        brandItem.proGift.push(product)
      }

      // 加价购、买赠商品
      for (let j = 0; j < brands[i].promotions.length; j++) {
        const isGIFT =
          brands[i].promotions[j].promotion_type.promotion_type == 'GIFT'
        const isFIXED_PRICE =
          brands[i].promotions[j].promotion_type.promotion_type == 'FIXED_PRICE'

        if (isGIFT) {
          for (
            let k = 0;
            k < brands[i].promotions[j].selected_gifts.length;
            k++
          ) {
            const item = brands[i].promotions[j].selected_gifts[k]
            let product = {}
            product.title = item.title
            product.main_image = item.image
            product.original_price = item.price
            // product.sku_attr = item.sku_attr;(没有)
            // product.quantity = item.quantity;(没有)
            product.retail_price = item.retail_price
            product.promotion_type_name = '赠品'

            brandItem.proGift.push(product)
          }
        } else if (isFIXED_PRICE) {
          for (
            let k = 0;
            k < brands[i].promotions[j].selected_gifts.length;
            k++
          ) {
            const item = brands[i].promotions[j].selected_gifts[k]
            let product = {}

            product.title = item.product_main.title
            product.main_image = item.main_image
            product.original_price = item.original_price
            product.sku_attr = item.sku_attr
            product.quantity = item.quantity
            product.retail_price = item.retail_price
            product.productGiftId = item.id
            product.promotion_type_name = '换购'

            brandItem.proGift.push(product)
          }
        }
      }
      returnObj.allProGiftList.push(brandItem)
      // console.log('brandsArr', brandsArr);
    }

    return returnObj
  },

  /**
   * 显示选择优惠
   */
  showDiscounts: function() {
    let show = this.data.show

    show.chooseDiscounts = true

    this.setData({
      show
    })
  },

  /**
   * 点击微信支付
   */
  wechatPay: function(e) {
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 30000
    })

    this.createOrder()
  },

  /**
   * 支付步骤1：创建支付订单（获得ip和order_id）
   */
  createOrder: function() {
    const that = this
    const orderDataObj = this.data.orderDataObj

    util.requestLoginUrl({
      url: constant.getRfidOrderInfo,
      method: 'POST',
      data: orderDataObj,
      success: function(res) {
        that.postOrder(res.id)
      },
      fail: function() {
        Taro.hideToast()
      }
    })
  },

  /**
   * 支付步骤2：获得post支付的pay_config(参数记得加上，function(orderId))
   */
  postOrder: function(orderId) {
    const gotoUrl =
      '/rfid/order/detail?id=' + orderId + '&type=rfid&from_share=1'
    util.payOrder(orderId, gotoUrl)
  },

  /**
   * 支付步骤3：调用微信接口
   */
  wxPayRequest: function(obj, orderId) {
    obj.timeStamp = obj.timeStamp + ''

    obj.success = function(res) {}

    obj.fail = function(res) {}

    obj.complete = function(res) {
      Taro.redirectTo({
        url: '/rfid/order/detail?id=' + orderId + '&type=rfid&from_share=1'
      })
    }

    Taro.requestPayment(obj)
  }
}

const assignedObject = util.assignObject(
  pageData,
  chooseDiscounts,
  returnToHome
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '汉光百货',
    enablePullDownRefresh: false
  }

  render() {
    const {
      allProGiftList: allProGiftList,
      allReduced: allReduced,
      reducedAmount: reducedAmount,
      coupons: coupons,
      otherInfo: otherInfo,
      showReturnToHome: showReturnToHome,
      showCoupons: showCoupons,
      pointShow: pointShow,
      show: show
    } = this.state
    return (
      <View className="order-page">
        <View className="product-section">
          <OrderProductTmpl
            data={{
              proGift: allProGiftList
            }}
          ></OrderProductTmpl>
        </View>
        {allReduced > 0 && (
          <View className="all-active">
            <View className="choose-ticket">
              <View className="left">已减金额</View>
              <View className="right mar-right-0">{'-￥' + allReduced}</View>
            </View>
            <View className="active-item red-span">
              {reducedAmount.map((item, index) => {
                return (
                  <Block key={'order-write-info-' + index}>
                    {item.amount - 0 > 0 && (
                      <View className="item">
                        <View className="left">
                          <LabelRedTmpl
                            data={{
                              value: item.span
                            }}
                          ></LabelRedTmpl>
                        </View>
                        <View className="left-info">{item.name}</View>
                        <View className="right">{'-￥' + item.amount}</View>
                      </View>
                    )}
                  </Block>
                )
              })}
            </View>
          </View>
        )}
        {(coupons.c_coupon || coupons.a_coupon || coupons.coupons) && (
          <View className="all-active">
            <View className="choose-ticket" onClick={this.showDiscounts}>
              <View className="left">优惠选择</View>
              <View className="sparrow-icon icon-enter"></View>
              {/*  有优惠券 并且 没使用优惠券（优惠金额和c券使用数额一样）  */}
              {coupons.coupons.length > 0 &&
              coupons.total_used_amount == coupons.c_coupon.selected_amount ? (
                <View className="right">
                  {'有' + coupons.coupons.length + '张优惠券可用'}
                </View>
              ) : (
                <View className="right">
                  {'-￥' + coupons.total_used_amount}
                </View>
              )}
            </View>
            {coupons.coupons.map((item, index) => {
              return (
                <Block key={'coupons-' + index}>
                  {item.checked && item.used_amount - 0 > 0 && (
                    <View className="active-item">
                      <View className="item">
                        <View className="left font-12">{item.title}</View>
                        <View className="right">
                          {'-￥' + item.used_amount}
                        </View>
                      </View>
                    </View>
                  )}
                </Block>
              )
            })}
            {coupons.a_coupon.used_amount > 0 && (
              <Block>
                <View className="active-item">
                  <View className="item">
                    <View className="left font-12">礼金抵扣</View>
                    <View className="right">
                      {'-￥' + coupons.a_coupon.used_amount}
                    </View>
                  </View>
                </View>
              </Block>
            )}
            {coupons.c_coupon.used_amount > 0 && (
              <Block>
                <View className="active-item">
                  <View className="item">
                    <View className="left font-12">C券抵扣</View>
                    <View className="right">
                      {'-￥' + coupons.c_coupon.used_amount}
                    </View>
                  </View>
                </View>
              </Block>
            )}
          </View>
        )}
        <View className="shipments">
          <View className="choose-shipments" onClick={this.showExpress}>
            <View className="left">配送方式</View>
            <View className="right help-youself">自提</View>
          </View>
          <View className="invoice-text">
            <View className="left">发票信息</View>
            <View className="right">
              <View className="text1">发票实买实开</View>
              <View className="text2">在支付完成的订单内选择生成电子发票</View>
            </View>
          </View>
        </View>
        <View className="order-pay">
          <View className="pay-money">
            <Text className="text1">合计金额：</Text>
            <Text className="text2">
              {'￥' + otherInfo.total_actual_amount}
            </Text>
          </View>
          <View className="get-point">
            {'获得积分：' + otherInfo.total_points}
          </View>
          <View>
            <Button className="wx-pay" type="primary" onClick={this.wechatPay}>
              微信安全支付
            </Button>
            {/*  <button class="other-pay"> 其他方式支付 </button>   */}
          </View>
        </View>
        <ReturnToHomeTmpl
          data={{
            showReturnToHome: showReturnToHome
          }}
        ></ReturnToHomeTmpl>
        {/*  选择优惠弹层  */}
        {show.chooseDiscounts && (
          <ChooseDiscountsTmpl
            data={{
              coupons: (showCoupons, pointShow)
            }}
          ></ChooseDiscountsTmpl>
        )}
        <View className="weui-footer">
          <View className="weui-footer__text">北京汉光百货有限责任公司</View>
          <View className="weui-footer__text">
            Copyright © 2008-2016 hanguangbaihuo.com
          </View>
        </View>
      </View>
    )
  }
}

export default _C
