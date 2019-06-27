import {
  Block,
  View,
  Text,
  Textarea,
  Button,
  Image,
  Input
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'

import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import chooseDiscounts from './popup/chooseDiscounts/chooseDiscounts.js'
import chooseExpress from './popup/chooseExpress/chooseExpress.js'
import orderProduct from '../../component/orderProduct/orderProduct.js'
import GIO_utils from '../../utils/GIO_utils.js'

import ChooseExpressTmpl from '../../imports/ChooseExpressTmpl.js'
import ChooseDiscountsTmpl from '../../imports/ChooseDiscountsTmpl.js'
import OrderProductTmpl from '../../imports/OrderProductTmpl.js'
import LabelRedTmpl from '../../imports/LabelRedTmpl.js'
import './order.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    show: {
      // 弹出层的显示
      chooseDiscounts: false,
      chooseExpress: false,
      textareaDisabled: false
    },
    address: {}, // 选择的地址
    allReduced: 0, // 总共的已减金额
    reducedAmount: [], // 具体的已减金额
    allProGiftList: [], // 展示所有的商品信息
    showThree: {}, // 订单页显示的最多三样商品信息
    proGiftLength: 0, // 订单中所有商品（包括赠品加价购）数
    shipping: [], // 加载所有快递信息，传递给弹框（单独向后台获取的数据）
    coupons: {}, // 优惠券积分等信息
    showCoupons: {}, // 在优惠弹框中展示的数据，初始时和coupons一样，后期因为用户更改弹框内的优惠信息，但是又没有确定而不一样，
    clickChooseAddr: false, // 是否点击了选择地址
    show_express_hint: false // 是否展示物流提示
  },

  orderId: 0,
  orderType: '',
  productInfoForGIO: [],
  orderInfoForGIO: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrderInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    util.printLog('wechat_app', 'go_to_bill', '')

    if (this.data.clickChooseAddr) {
      // 从选择地址的页面navigateBack回来的，需要重新获取订单信息,以方便拿到新的地址信息

      const _this = this
      this.data.clickChooseAddr = false
      this.setData(
        {
          data: {},
          show: {
            // 弹出层的显示
            chooseDiscounts: false,
            chooseExpress: false,
            textareaDisabled: false
          },
          address: {}, // 选择的地址
          allReduced: 0, // 总共的已减金额
          reducedAmount: [], // 具体的已减金额
          allProGiftList: [], // 展示所有的商品信息
          showThree: {}, // 订单页显示的最多三样商品信息
          proGiftLength: 0, // 订单中所有商品（包括赠品加价购）数
          shipping: [], // 加载所有快递信息，传递给弹框（单独向后台获取的数据）
          coupons: {}, // 优惠券积分等信息
          showCoupons: {}, // 在优惠弹框中展示的数据，初始时和coupons一样，后期因为用户更改弹框内的优惠信息，但是又没有确定而不一样，
          clickChooseAddr: false // 是否点击了选择地址
        },
        function() {
          _this.getOrderInfo()
        }
      )
    }
  },

  /**
   * 选择收货地址
   */
  clickChooseAddress: function() {
    this.data.clickChooseAddr = true
    Taro.navigateTo({
      url: '/packageA/order/pages/chooseAddress/chooseAddress'
    })
  },

  /**
   * 展示所有商品
   */
  showAllMerchandise: function() {
    wx.globalData.allProGiftList = this.data.allProGiftList
    wx.globalData.proGiftLength = this.data.proGiftLength

    Taro.navigateTo({
      url: './pages/allMerchandise/allMerchandise'
    })
  },

  /**
   * 获取订单信息
   */
  getOrderInfo: function() {
    const that = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.getOrderInfo,
      method: 'GET',
      success: function(data) {
        that.handleOrderInfo(data)
        that.judgeDate()
        Taro.hideToast()
      },
      fail: function(err) {
        Taro.hideToast()
      }
    })
  },

  /**
   * 判断是否展示物流提示
   */
  judgeDate: function() {
    let show_express_hint = false

    const now_date = Date.parse(new Date())
    const last_date = Date.parse(new Date('February 10, 2019 23:59:59'))
    const distance = last_date - now_date
    if (distance > 0) {
      this.setData({
        show_express_hint: true
      })
    }
  },

  /**
   * 处理后台返回的订单信息
   */
  handleOrderInfo: function(data) {
    const allReduced = data.total_discount_price
    const reducedAmount = this.caculateReducedAmount(data.brands, data.hg)
    const returnObj = this.turnToProGiftList(data.brands)
    const allProGiftList = returnObj.allProGiftList
    const proGiftLength = returnObj.proGiftLength
    const showThree = this.showThressProGiftList(allProGiftList)
    let address = data.shipping.address
    const coupons = data.coupons
    const showCoupons = data.coupons
    const shipping = data.shipping.shipping_method
    const otherInfo = {}

    otherInfo.actual_amount = data.actual_amount
    otherInfo.total_actual_amount = data.total_actual_amount.toFixed(2) // 含邮费
    otherInfo.shipping_type = data.shipping.shipping_type
    otherInfo.postage = data.shipping.postage
    otherInfo.note = data.note
    otherInfo.total_points = data.total_points

    if (!(address.name && address.city)) {
      address = ''
      this.showAddAddressModal()
    }

    this.setData({
      otherInfo,
      address,
      allReduced,
      reducedAmount,
      allProGiftList,
      showThree,
      proGiftLength,
      coupons,
      showCoupons,
      shipping
    })
  },

  /**
   * 提示让用户添加地址
   */
  showAddAddressModal: function() {
    const _this = this
    Taro.showModal({
      title: '提示',
      content: '您还没添加地址，是否现在添加地址？',
      cancelText: '否',
      confirmText: '是',
      success: function(res) {
        if (res.confirm) {
          _this.clickChooseAddress()
        }
      }
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
    returnObj.proGiftLength = 0

    for (let i = 0; i < brands.length; i++) {
      let brandItem = {}
      brandItem.brandName = brands[i].name
      brandItem.brandId = brands[i].id
      brandItem.proGift = [] // 在该品牌下的商品和加价购、买赠商品
      brandItem.shopName = brands[i].shop.name
      brandItem.floorName = brands[i].shop.floor.name
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
        product.productMainId = item.product_main.id

        product.promotionName = this.returnPromotionStr(
          'promotionName',
          item.promotion_choice_to_dic
        )
        product.promotionType = this.returnPromotionStr(
          'promotionType',
          item.promotion_choice_to_dic
        )

        returnObj.proGiftLength += item.quantity

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
            product.retail_price = item.retail_price
            product.promotion_type_name = '赠品'

            brandItem.proGift.push(product)
            returnObj.proGiftLength++
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
            product.productMainId = item.product_main.id
            product.promotionName = brands[i].promotions[j].title
            product.promotionType = brands[i].promotions[j].promotion_type.name

            brandItem.proGift.push(product)
            returnObj.proGiftLength++
          }
        }
      }
      returnObj.allProGiftList.push(brandItem)
      // console.log('brandsArr', brandsArr);
    }

    return returnObj
  },

  /**
   * 仅显示三样商品
   */
  showThressProGiftList: function(list) {
    let showThree = []
    let newIndex = 0
    for (let i = 0; i < list.length; i++) {
      if (newIndex < 3) {
        let obj = {}
        obj.brandName = list[i].brandName
        obj.proGift = []

        for (let j = 0; j < list[i].proGift.length; j++) {
          if (newIndex < 3) {
            obj.proGift.push(list[i].proGift[j])
            newIndex++
          }
        }

        showThree.push(obj)
      }
    }
    return showThree
  },

  /**
   * 显示选择配送方式
   */
  showExpress: function() {
    let show = this.data.show

    show.chooseExpress = true
    show.textareaDisabled = true

    this.setData({
      show
    })
  },

  /**
   * 显示选择优惠
   */
  showDiscounts: function() {
    let show = this.data.show

    show.chooseDiscounts = true
    show.textareaDisabled = true

    this.setData({
      show
    })
  },

  /**
   * 输入留言
   */
  inputNotes: function(e) {
    this.data.otherInfo.note = e.detail.value
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

    this.postNote(this.data.otherInfo.note)
  },

  /**
   * 失焦之后就post用户留言
   */
  blurPostNote: function() {
    const note = this.data.otherInfo.note
    const otherInfo = this.data.otherInfo
    this.setData({
      otherInfo
    })

    util.request({
      url: constant.postNote,
      method: 'POST',
      data: {
        note: note
      },
      success: function() {}
    })
  },

  /**
   * post用户留言
   */
  postNote: function(note) {
    const that = this

    util.request({
      url: constant.postNote,
      method: 'POST',
      data: {
        note: note
      },
      success: function() {
        that.createOrder()
      }
    })
  },

  /**
   * 支付步骤1：创建支付订单（获得ip和order_id）
   */
  createOrder: function() {
    const _this = this

    util.request({
      url: constant.createOrder,
      method: 'POST',
      data: {},
      success: function(res) {
        _this.orderId = res.id
        _this.orderType = res.order_type
        _this.handle_product_for_GIO()
        _this.handle_order_for_GIO()
        _this.postOrder(res.id)

        const orderObj = _this.get_order_obj('createOrder', 'checkOut')
        GIO_utils.send_GIO_after_pay_success(orderObj)

        // 正常流程付款不需要发送paySKUOrder和payOrder给GIO
        // const payObj = _this.get_order_obj('paySKUOrder', 'payOrder');
        // GIO_utils.send_GIO_after_pay_success(payObj);
      },
      fail: function() {
        Taro.hideToast()
      }
    })
  },

  /**
   * 为发送给GIO准备商品数据
   */
  handle_product_for_GIO: function() {
    const productArr = this.data.allProGiftList
    let productInfoForGIO = []
    for (let i = 0; i < productArr.length; i++) {
      // 品牌
      const brand = productArr[i]
      for (let j = 0; j < brand.proGift.length; j++) {
        // 同一件商品
        const product = brand.proGift[j]
        if (!(product.promotion_type_name == '赠品')) {
          // 普通商品和加价购

          const productId_var = product.productGiftId || ''
          const productMainName_var = brand.brandName + ' ' + product.title
          const brandName_var = brand.brandName || ''
          const productSkuAttr_var = product.sku_attr || ''
          const productCartNumber_var = product.quantity || ''
          const skuDep_var = brand.shopName || ''
          const skuFloor_var = brand.floorName || ''
          const campaignName_var = product.promotionName
          const campaignType_var = product.promotionType
          const orderId_var = this.orderId
          const orderType_var = GIO_utils.return_order_type(this.orderType)
          const retailPrice_var = product.retail_price || ''
          const productMainId_var = product.productMainId || ''

          // const brandId_var = brand.brandId || '';
          // const originalPrice_var = product.original_price || '';
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

          productInfoForGIO.push(obj)
        }
      }
    }
    this.productInfoForGIO = productInfoForGIO
  },

  /**
   * 为发送给GIO准备订单数据
   */
  handle_order_for_GIO: function() {
    const productCartNumber_var = this.data.proGiftLength // 这里包括赠品数量
    const orderId_var = this.orderId
    const orderType_var = GIO_utils.return_order_type(this.orderType)
    const couponInfo = this.return_coupon_info_for_GIO()
    console.log(couponInfo)
    const { ifCouponUsed_var } = couponInfo
    const { couponType_var } = couponInfo
    const { couponName_var } = couponInfo
    const payAmount_var = parseFloat(this.data.otherInfo.total_actual_amount)
    let ifFreeShipping_var = '是'
    if (this.data.otherInfo.postage - 0 > 0) {
      ifFreeShipping_var = '否'
    }

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
  },

  /**
   * 获得发送给GIO的数据
   */
  get_order_obj: function(product_event, order_event) {
    const { productInfoForGIO, orderInfoForGIO } = this

    const orderObj = {
      productInfoForGIO,
      orderInfoForGIO,
      productEvent: product_event,
      orderEvent: order_event
    }

    return orderObj
  },

  /**
   * for GIO:返回活动名称/类型字符串
   */
  returnPromotionStr: function(returnType, promotion) {
    let str = ''

    if (returnType == 'promotionName') {
      promotion.forEach(function(item) {
        str += '|' + item.title
      })
    } else if (returnType == 'promotionType') {
      promotion.forEach(function(item) {
        str += '|' + item.promotion_type.name
      })
    }

    if (str) {
      str = str.slice(1)
    }

    return str
  },

  /**
   * 为发送给GIO准备优惠券信息
   */
  return_coupon_info_for_GIO: function() {
    const couponsInfo = this.data.coupons
    const ifCouponUsed_var = couponsInfo.total_used_amount - 0 > 0 ? '是' : '否'
    let couponType_var = '',
      couponName_var = ''

    couponType_var =
      couponsInfo.c_coupon && couponsInfo.c_coupon.used_amount - 0 > 0
        ? '|C券'
        : ''
    couponName_var =
      couponsInfo.c_coupon && couponsInfo.c_coupon.used_amount - 0 > 0
        ? '|C券'
        : ''

    if (couponsInfo.coupons) {
      couponsInfo.coupons.forEach(item => {
        if (item.checked) {
          couponType_var += '|' + '礼券'
          couponName_var += '|' + item.title
        }
      })
    }

    if (couponType_var) {
      couponType_var = couponType_var.slice(1)
      couponName_var = couponName_var.slice(1)
    }

    return { ifCouponUsed_var, couponType_var, couponName_var }
  },

  /**
   * 支付步骤2：获得post支付的pay_config(参数记得加上，function(orderId))
   */
  postOrder: function(orderId) {
    const gotoUrl =
      '/pages/usercenter/components/onlineOrders/components/orderDetail/index?id=' +
      orderId +
      '&type=line'
    const orderObj = this.get_order_obj('paySKUSuccess', 'payOrderSuccess')
    const func = GIO_utils.send_GIO_after_pay_success

    util.payOrder(orderId, gotoUrl, func, orderObj)
  },

  /**
   * 返回购物车
   */
  turnToCart: function() {
    Taro.navigateBack({
      delta: 1
    })
  }
}

const assignedObject = util.assignObject(
  pageData,
  chooseDiscounts,
  chooseExpress,
  orderProduct
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '填写订单',
    enablePullDownRefresh: false
  }

  render() {
    const {
      address: address,
      showThree: showThree,
      proGiftLength: proGiftLength,
      otherInfo: otherInfo,
      allReduced: allReduced,
      reducedAmount: reducedAmount,
      coupons: coupons,
      show: show,
      show_express_hint: show_express_hint,
      showCoupons: showCoupons,
      pointShow: pointShow,
      shipping: shipping
    } = this.state
    return (
      <View className="order-page">
        <View className="title">
          {address ? (
            <View className="order-address" onClick={this.clickChooseAddress}>
              <View className="left sparrow-icon icon-manage-address"></View>
              <View className="center">
                <View className="personal-info">
                  <Text className="name">{address.name}</Text>
                  <Text className="number">{address.phone}</Text>
                </View>
                <View className="personal-address">
                  {address.province +
                    address.city +
                    address.district +
                    address.detail}
                </View>
              </View>
              <View className="right sparrow-icon icon-enter"></View>
            </View>
          ) : (
            <View
              className="order-no-address"
              onClick={this.clickChooseAddress}
            >
              <View className="left sparrow-icon icon-warning"></View>
              <View className="center">非自提需填写收件地址</View>
              <View className="right sparrow-icon icon-enter"></View>
            </View>
          )}
          <View className="border-img"></View>
        </View>
        <View className="product-section">
          <OrderProductTmpl
            data={{
              proGift: showThree
            }}
          ></OrderProductTmpl>
          <View className="show-all-product">
            {proGiftLength > 3 && (
              <Block>
                <View
                  className="sparrow-icon icon-enter"
                  onClick={this.showAllMerchandise}
                ></View>
                <View className="text" onClick={this.showAllMerchandise}>
                  {'全部' + proGiftLength + '件商品'}
                </View>
              </Block>
            )}
            <View className="inital-pay">{'￥' + otherInfo.actual_amount}</View>
          </View>
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
            <View className="sparrow-icon icon-enter"></View>
            <View className="right">
              {otherInfo.shipping_type == 'express' && (
                <Block>
                  {otherInfo.postage - 0 > 0 ? (
                    <View className="help-youself">
                      {'快递： ￥' + otherInfo.postage}
                    </View>
                  ) : (
                    <View className="help-youself">快递： 包邮</View>
                  )}
                </Block>
              )}
              {otherInfo.shipping_type == 'self_service' && (
                <Block>
                  <View className="help-youself">到店自提</View>
                </Block>
              )}
              {/*  <block wx:if="{{otherInfo.shipping_type == 'FLASH'}}"> 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <view class="help-youself">闪送</view>     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </block>    */}
            </View>
          </View>
          <View className="invoice-text">
            <View className="left">发票信息</View>
            <View className="right">
              <View className="text1">发票实买实开</View>
              <View className="text2">在支付完成的订单内选择生成电子发票</View>
            </View>
          </View>
        </View>
        <View className="leave-a-message margin-bottom-100">
          <View className="left">买家留言</View>
          <View className="right">
            {/*  为了textarea不穿层，可以在js控制其他弹层打开的时候disable，并把字体颜色设为透明  */}
            {show.textareaDisabled ? (
              <View className="input-note">{otherInfo.note}</View>
            ) : (
              <Textarea
                className={
                  'input-note ' +
                  (show.textareaDisabled ? 'textarea-transparent' : '')
                }
                disabled={show.textareaDisabled}
                onInput={this.inputNotes}
                onBlur={this.blurPostNote}
                value={otherInfo.note}
              ></Textarea>
            )}
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
          <View className="pay-out-view">
            <Button className="wx-pay" type="primary" onClick={this.wechatPay}>
              微信安全支付
            </Button>
            <View
              className={'express_hint ' + (show_express_hint ? '' : 'hidden')}
            >
              【物流提示】1.30-2.11停发外省，北京收送时效延迟，请谅解。
            </View>
            {/*  <button class="other-pay"> 其他方式支付 </button>   */}
          </View>
          <View className="return-btn">
            <I
              className="sparrow-icon icon-arrows-left"
              onClick={this.turnToCart}
            ></I>
            <Text onClick={this.turnToCart}>返回</Text>
          </View>
        </View>
        {/*  选择优惠弹层  */}
        {show.chooseDiscounts && (
          <ChooseDiscountsTmpl
            data={{
              coupons: (showCoupons, pointShow)
            }}
          ></ChooseDiscountsTmpl>
        )}
        {/*  选择快递弹层  */}
        {show.chooseExpress && (
          <ChooseExpressTmpl
            data={{
              shippingType: (otherInfo.shipping_type, shipping)
            }}
          ></ChooseExpressTmpl>
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
