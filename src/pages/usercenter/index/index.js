import {
  Block,
  View,
  OpenData,
  Text,
  Canvas,
  Navigator
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import constant from '../../../config/constant.js'
import util from '../../../utils/util.js'
import onlineOrdersConfig from '../components/onlineOrders/index.js'
import storeServicesConfig from '../components/storeServices/index.js'
import './index.scss'
const app = Taro.getApp()
let pageConfig = {
  /**
   * 页面的初始数据
   */
  data: {
    tabbar: {},
    name: '',
    phone: '',
    levelName: '汉光会员',
    level: '',
    cardID: '',
    image: '',
    points_data: '',
    account_id: '',
    // 计时器id
    timerID: '',
    order_count_data: {
      // 待付款
      unpaid_count: 0,
      // 待发货
      init_count: 0,
      // 可自提
      to_pickup_count: 0
    },
    cardStyleOptions: {
      // 普卡会员
      ordinatyMember: {
        // 背景颜色
        backgroundColor: 'linear-gradient(#6D7487, #454955)',
        // 会员级别名称
        persongradetextColor: '#DFE7F3',
        // 会员级别图标
        persongradeIconColor: '#939AAD',
        // 会员卡ID
        persongradeIDColor: '#8A92A3',
        // 优惠券名称
        couponsTitle: '#8E94A6',
        // 优惠券金额
        couponsValue: '#DFE7F3',
        // 条形码背景颜色
        barcodeBackgroundColor: '#fff'
      },
      // 银卡会员
      silverMember: {
        // 背景颜色
        backgroundColor: 'linear-gradient(#A3B5C9, #DAE1E5)',
        // 会员级别名称
        persongradetextColor: '#5D6877',
        // 会员级别图标
        persongradeIconColor: '#76808E',
        // 会员卡ID
        persongradeIDColor: '#5D6877',
        // 优惠券名称
        couponsTitle: '#5D6877',
        // 优惠券金额
        couponsValue: '#455162',
        // 条形码背景颜色
        barcodeBackgroundColor: '#fff'
      },
      // 金卡会员
      goldMember: {
        // 背景颜色
        backgroundColor: 'linear-gradient(#E6D2AA, #D1B680)',
        // 会员级别名称
        persongradetextColor: '#FEFDFC',
        // 会员级别图标
        persongradeIconColor: '#AB916C',
        // 会员卡ID
        persongradeIDColor: '#F7EED5',
        // 优惠券名称
        couponsTitle: '#B19770',
        // 优惠券金额
        couponsValue: '#9A8465',
        // 条形码背景颜色
        barcodeBackgroundColor: '#fff'
      }
    },
    // 会员卡片样式
    cardStyle: {
      // 背景颜色
      backgroundColor: 'linear-gradient(#DAE1E5, #A3B5C9)',
      // 会员级别名称
      persongradetextColor: '#7F8698',
      // 会员级别图标
      persongradeIconColor: '#7F8698',
      // 会员卡ID
      persongradeIDColor: '#7F8698',
      // 优惠券名称
      couponsTitle: '#7F8698',
      // 优惠券金额
      couponsValue: '#7F8698',
      // 条形码背景颜色
      barcodeBackgroundColor: '#fff'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('会员中心options', options)
    // 扫描导购二维码进入会员中心的用户，如果没有生日信息，需要进行信息补全，且不能跳过
    let user_from = util.returnUrlSubstr(decodeURIComponent(options.q))
    console.log('会员中心user_from', user_from)
    wx.globalData.user_from = user_from
    // 扫描导购二维码进入会员中心的用户，将导购id存入日志 source, action, content
    util.printLog('guide_qrcode', 'scan', user_from)
    // 通过微信公众号菜单栏进入的用户，如果没有生日信息，需要进行信息补全，且不能跳过
    let sourse = options.sourse
    console.log('会员中心sourse', sourse)
    wx.globalData.sourse = sourse
    // 扫描导购二维码进入会员中心的用户，将导购id存入日志 source, action, content
    util.printLog('weixin_menu_bar', 'click', sourse)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.barcodeRefreshTimer()
    this.setData({
      name: '',
      levelName: '',
      cardID: '',
      image: ''
    })
    this.getUserInfo()
  },
  /**
   * 生命周期函数--监听小程序切后台事件
   */
  onHide: function() {
    clearInterval(this.data.timerID)
  },

  /**
   * 生命周期函数--监听小程序页面卸载事件
   */
  onUnload: function() {
    clearInterval(this.data.timerID)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      name: '',
      levelName: '汉光会员',
      cardID: '',
      image: ''
    })
    this.getUserInfo()
    Taro.stopPullDownRefresh()
  },

  /**
   * 获取待付款，待发货，可自提订单数量
   */
  getOrderCountData: function(searchParams) {
    let _this = this
    let { order_count_data } = _this.data
    // 未付款订单数量
    util.request({
      url: `${constant.orderLine}?page_size=1&page=1&status=unpaid`,
      success: function(data) {
        order_count_data.unpaid_count = data.count
        _this.setData({
          order_count_data
        })
      }
    })
    // 待发货订单数量
    util.request({
      url: `${constant.orderLine}?page_size=1&page=1&status=to_ship`,
      success: function(data) {
        order_count_data.init_count = data.count
        _this.setData({
          order_count_data
        })
      }
    })
    // 可自提订单数量
    util.request({
      url: `${constant.orderLine}?page_size=1&page=1&status=to_pickup`,
      success: function(data) {
        order_count_data.to_pickup_count = data.count
        _this.setData({
          order_count_data
        })
      }
    })
  },
  /**
   * 计时器-计算条形码的刷新
   */
  barcodeRefreshTimer: function() {
    let { timerID } = this.data
    timerID = setInterval(() => {
      this.getMemberCode()
    }, 60000)
    this.setData({
      timerID
    })
  },

  // 强制刷新页面，清空缓存
  clearUserCache: function() {
    let { phone } = this.data
    // 调用后台接口，清空用户数据缓存
    util.clearUserCache(phone)
    Taro.reLaunch({
      url: '/pages/usercenter/index/index'
    })
  },

  /**
   * 点击跳转到礼金详情
   */
  redirectToCashGiftDetail: function() {
    Taro.navigateTo({
      url: `/pages/usercenter/components/userInfo/components/cashGiftDetail/index?phone=${this.data.phone}&account_id=${this.data.account_id}`
    })
  },

  /**
   * 点击跳转到优惠券列表
   */
  redirectToCouponList: function() {
    Taro.navigateTo({
      url: `/pages/usercenter/components/userInfo/components/couponList/index?account_id=${this.data.account_id}`
    })
  },

  /**
   * 点击跳转到停车券列表
   */
  redirectToParkingCouponList: function() {
    let { level, account_id, points_data } = this.data
    if (
      (points_data.car_coupons_count === 0) |
      (points_data.car_coupons_count === '0')
    ) {
      // 1.普卡会员——升级银卡可享停车优惠
      // 2.银卡 / 金卡会员——当日消费满500获停车券1张
      if (level === 'MEMBER_L0') {
        Taro.showModal({
          title: '提示信息',
          content: '升级银卡可享停车优惠',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      } else {
        Taro.showModal({
          title: '获取方式',
          content: '当日店内消费满500元可获停车券1张',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      }
      return
    }
    Taro.navigateTo({
      url: `/pages/usercenter/components/userInfo/components/parkingCouponList/index?account_id=${account_id}`
    })
  },

  /**
   * 积分兑换
   */
  handleConvertingPonits: function() {
    const _this = this
    const { account_id, phone } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.getPoint}?phone=${phone}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success && res.data.points >= 1000) {
          // 重新获取用户积分，换算可兑换积分，然后弹窗提示
          // util.showModalConfirm({
          //   title: '积分兑换礼金',
          //   content: `是否将现有${util.convertingPointsIntoGifts(res.data.points) * 100}积分兑换成${util.convertingPointsIntoGifts(res.data.points)}元礼金?`,
          //   confirm: _this.confirmExchangePonits(),
          //   cancel: console.log('用户点击取消'),
          // })
          Taro.showModal({
            title: '积分兑换礼金',
            content: `是否将现有${util.convertingPointsIntoGifts(
              res.data.points
            ) * 100}积分兑换成${util.convertingPointsIntoGifts(
              res.data.points
            )}元礼金?`,
            success(res) {
              if (res.confirm) {
                _this.confirmExchangePonits()
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        } else {
          util.showModalMsg({
            content: '礼金1000积分起兑'
          })
        }
      }
    })
  },

  /**
   * 确认积分兑换
   */
  confirmExchangePonits: function() {
    const _this = this
    const { account_id } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: `${constant.exchangePoint}?accountid=${account_id}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          util.showModalMsg({
            content: '兑换成功'
          })
          Taro.reLaunch({
            url: '/pages/usercenter/index/index'
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
        }
      }
    })
  },

  /**
   * 联系客服
   */
  callToService: function() {
    util.printLog('wechat_app', 'contact', 'service')
    Taro.makePhoneCall({
      phoneNumber: constant.SERVICE_PHONE
    })
  },

  /**
   * 点击进入品牌页面
   */
  switchTabToBrand: function() {
    Taro.switchTab({
      url: '/pages/brand/index/index'
    })
  },

  /**
   * 点击进入会员权益页面
   */
  redirectToMembershipInterests: function() {
    Taro.navigateTo({
      url: '/pages/gridsNew/index?id=5'
    })
  },

  /**
   * 获得用户信息
   */
  getUserInfo: function() {
    const _this = this
    const { cardStyleOptions } = _this.data
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })
    util.request({
      url: constant.getUserSimpleInfo,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        console.log('会员信息', res)
        wx.globalData.has_birthday =
          res.member.birthday || res.member.birthday === 'U' ? true : false
        let cardID = res.level.number
        let level = res.level.level
        // 获取用户会员卡等级
        const levelName = util.determineMembershipLevel(res.level.level)
        let cardStyle = {}
        if (res.level.level === 'MEMBER_L0') {
          // 普卡会员
          cardStyle = cardStyleOptions.ordinatyMember
        } else if (res.level.level === 'MEMBER_L1') {
          // 银卡会员
          cardStyle = cardStyleOptions.silverMember
        } else if (res.level.level === 'MEMBER_L2') {
          // 金卡会员
          cardStyle = cardStyleOptions.goldMember
        }
        // 获取用户积分以及其他优惠券数量
        _this.getPoint(res.username)
        // 获取用户停车券列表
        const account_id = res.level.account_id
        // 获取会员卡条形码
        _this.getMemberCode()
        // 用户手机号
        const phone = res.username
        wx.globalData.phone = res.username
        _this.setData({
          level,
          levelName,
          cardStyle,
          account_id,
          phone,
          cardID
        })
        // 延时请求，获取线上购物待付款，代发货，可自提订单数量
        setTimeout(() => {
          _this.getOrderCountData()
        }, 1000)
      }
    })
  },

  /**
   * 获取用户积分以及其他优惠券数量
   */
  getPoint: function(phone) {
    const _this = this
    util.request({
      url: `${constant.getPoint}?phone=${phone}`,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        if (res.success) {
          const points_data = _this.formatPointsData(res.data)
          _this.setData({
            points_data
          })
        } else {
          util.showModalMsg({
            content: res.errmsg
          })
        }
      }
    })
  },

  // 格式化用户积分数据
  formatPointsData: function(data) {
    let newData = {}
    newData.account_id = data.accountid
    newData.c_coupons = data.c_coupons
    newData.car_coupons_count = data.car_coupons_count
    newData.cardno = data.cardno
    newData.gift_coupons_count = data.gift_coupons_count
    newData.grade = data.grade
    newData.grademsg = data.grademsg
    newData.isgrade = data.isgrade
    newData.name = data.name
    newData.points = data.points
    newData.a_coupons_value = data.a_coupons ? data.a_coupons.balanceAmt : 0
    newData.gift_value = util.removeDecimalPoints(
      newData.c_coupons + newData.a_coupons_value
    )
    return newData
  },

  /**
   * 获取用户条码
   */
  getMemberCode: function() {
    const _this = this
    util.request({
      url: constant.getMemberCode,
      method: 'GET',
      success: function(res) {
        Taro.hideToast()
        const member_code = res.member_code
        util.createBarcode('barcode', member_code, 536, 90)
        _this.setData({
          member_code
        })
      }
    })
  },

  /**
   * 点击放大条形码
   */
  handlerShowBigBaicodeChange: function() {
    let { member_code, cardID } = this.data
    Taro.navigateTo({
      url: `/pages/usercenter/membershipCard/index?member_code=${member_code}&cardID=${cardID}`
    })
  },

  /**
   * 用户退出登录
   */
  userLogout: function() {
    const _this = this
    util.request({
      url: constant.userLogout,
      method: 'POST',
      data: {},
      success: function(res) {
        // 清除本地用户信息（如果不清除，退出后点击商品详情会自动登录，但是因为登录无效，所以进入登录页面，但是详情页面不能出现登录页面）
        Taro.removeStorageSync('key_user')
        util.user.logout()
        const gotoUrl = encodeURIComponent(
          `${util.returnCurrentPageUrlWithArgs()}`
        )
        Taro.reLaunch({
          url: `/vendingMachine/login/login?gotoUrl=${gotoUrl}`
        })
      },
      fail: function(err) {
        console.log('err', err)
      }
    })
  }
}

const assignedObject = util.assignObject(
  pageConfig,
  onlineOrdersConfig,
  storeServicesConfig
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '会员中心',
    enablePullDownRefresh: true,
    navigationBarBackgroundColor: '#2f3238',
    backgroundColor: '#2f3238',
    navigationBarTextStyle: 'white'
  }

  render() {
    const {
      cardStyle: cardStyle,
      levelName: levelName,
      cardID: cardID,
      points_data: points_data,
      level: level,
      order_count_data: order_count_data,
      phone: phone,
      account_id: account_id
    } = this.state
    return (
      <View className="page">
        <Block>
          <View className="background"></View>
          <View
            className="basic-stytle"
            style={'background:' + cardStyle.backgroundColor}
          >
            <View className="basic-info">
              <View className="item">
                <View className="portrait-out">
                  <View className>
                    <View className="portrait">
                      <OpenData type="userAvatarUrl"></OpenData>
                    </View>
                  </View>
                  <View className="level-name-content">
                    <Text
                      className="level-name"
                      style={'color:' + cardStyle.persongradetextColor}
                    >
                      {levelName}
                    </Text>
                  </View>
                  <View className="">
                    <I
                      className="sparrow-icon icon-personal-center-VIP"
                      style={'color:' + cardStyle.persongradeIconColor}
                    ></I>
                  </View>
                </View>
              </View>
              <View className="item card-id">
                <Text
                  style={'color:' + cardStyle.persongradeIDColor}
                  onClick={this.clearUserCache}
                >
                  {cardID}
                </Text>
              </View>
            </View>
            <View className="coupons">
              <View
                className="coupons-item"
                onClick={this.handleConvertingPonits}
              >
                <View style={'color:' + cardStyle.couponsTitle}>积分</View>
                <View
                  className="coupons-value"
                  style={'color:' + cardStyle.couponsValue}
                >
                  {points_data.points}
                </View>
              </View>
              <View className="separator"></View>
              {/*  礼券  */}
              <View
                className="coupons-item"
                onClick={this.redirectToCashGiftDetail}
              >
                <View style={'color:' + cardStyle.couponsTitle}>礼金</View>
                <View
                  className="coupons-value"
                  style={'color:' + cardStyle.couponsValue}
                >
                  {points_data.gift_value}
                  <Text className="small-text">元</Text>
                </View>
              </View>
              <View className="separator"></View>
              {/*  优惠券  */}
              <View
                className="coupons-item"
                onClick={this.redirectToCouponList}
              >
                <View style={'color:' + cardStyle.couponsTitle}>优惠券</View>
                <View
                  className="coupons-value"
                  style={'color:' + cardStyle.couponsValue}
                >
                  {points_data.gift_coupons_count}
                  <Text className="small-text">张</Text>
                </View>
              </View>
              {level !== 'MEMBER_L0' && <View className="separator"></View>}
              {/*  停车券  */}
              {level !== 'MEMBER_L0' && (
                <View
                  className="coupons-item"
                  onClick={this.redirectToParkingCouponList}
                >
                  <View style={'color:' + cardStyle.couponsTitle}>停车券</View>
                  <View
                    className="coupons-value"
                    style={'color:' + cardStyle.couponsValue}
                  >
                    {points_data.car_coupons_count}
                    <Text className="small-text">张</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          <View className="barcode" onClick={this.handlerShowBigBaicodeChange}>
            <View className="barcode-canvas">
              <Canvas canvasId="barcode"></Canvas>
            </View>
          </View>
        </Block>
        <View className="components-body">
          <View className="components-title">店内服务</View>
          <View className="grids">
            <View className="grid-item" onClick={this.redirectToShoppingRecord}>
              <View className="grid-icon  sparrow-icon icon-cardgouwujilu"></View>
              <View className="grid-label">发票开立</View>
            </View>
            <View className="grid-item" onClick={this.redirectToParkingPayment}>
              <View className="grid-icon  sparrow-icon icon-cardtingchejiaofei"></View>
              <View className="grid-label">停车缴费</View>
            </View>
            <View className="grid-item" onClick={this.handleConvertingPonits}>
              <View className="grid-icon sparrow-icon icon-cardjifenduihuan"></View>
              <View className="grid-label">积分兑换</View>
            </View>
          </View>
        </View>
        <View className="components-body">
          <View className="components-title">
            <View className="title-left">线上购物</View>
            <View
              className="title-right"
              onClick={this.redirectToAllOnlineOrders}
            >
              查看全部订单
            </View>
            <View
              className="sparrow-icon icon-enter"
              onClick={this.redirectToAllOnlineOrders}
            ></View>
          </View>
          <View className="grids">
            <View className="grid-item" onClick={this.redirectToUnpaidOrders}>
              <View className="weui-cell__hd">
                <View className="grid-icon sparrow-icon icon-carddaifukuan"></View>
                {order_count_data.unpaid_count > 0 && (
                  <View
                    className="weui-badge"
                    style="position: absolute;top: 10rpx;right: 50rpx;"
                  >
                    {order_count_data.unpaid_count}
                  </View>
                )}
              </View>
              <View className="grid-label">待付款</View>
            </View>
            <View className="grid-item" onClick={this.redirectToInitOrders}>
              <View className="weui-cell__hd">
                <View className="grid-icon sparrow-icon icon-carddaifahuo"></View>
                {order_count_data.init_count > 0 && (
                  <View
                    className="weui-badge"
                    style="position: absolute;top: 10rpx;right: 50rpx;"
                  >
                    {order_count_data.init_count}
                  </View>
                )}
              </View>
              <View className="grid-label">待发货</View>
            </View>
            <View
              className="grid-item"
              onClick={this.redirectToToDeliverOrders}
            >
              <View className="weui-cell__hd">
                <View className="grid-icon sparrow-icon icon-cardkeziti"></View>
                {order_count_data.to_pickup_count > 0 && (
                  <View
                    className="weui-badge"
                    style="position: absolute;top: 10rpx;right: 50rpx;"
                  >
                    {order_count_data.to_pickup_count}
                  </View>
                )}
              </View>
              <View className="grid-label">可自提</View>
            </View>
          </View>
        </View>
        <View className="components-body" style="height:474rpx">
          <View className="components-title">更多服务</View>
          <View className="grids">
            <View className="grid-item" onClick={this.switchTabToBrand}>
              <View className="grid-icon  sparrow-icon icon-cardpinpailiebiao"></View>
              <View className="grid-label">品牌列表</View>
            </View>
            <View className="grid-item" onClick={this.callToService}>
              <View className="grid-icon sparrow-icon icon-cardlianxiwomen"></View>
              <View className="grid-label">联系我们</View>
            </View>
            <Navigator
              url="/packageA/order/pages/chooseAddress/chooseAddress?from_user=1"
              className="grid-item"
            >
              <View className="grid-icon sparrow-icon icon-cardshouhuodizhi"></View>
              <View className="grid-label">收货地址</View>
            </Navigator>
          </View>
          <View className="grids">
            <View
              className="grid-item"
              onClick={this.redirectToMembershipInterests}
            >
              <View className="grid-icon  sparrow-icon icon-cardhuiyuanquanyi"></View>
              <View className="grid-label">会员权益</View>
            </View>
            <Navigator
              url={
                '/pages/usercenter/components/moreServices/components/changePhone/changePhone?phone=' +
                phone +
                '&account_id=' +
                account_id
              }
              className="grid-item"
            >
              <View className="grid-icon sparrow-icon icon-cardgaibangshouji"></View>
              <View className="grid-label">改绑手机</View>
            </Navigator>
            {/*  <navigator url="/pages/usercenter/components/moreServices/components/helpCenter/helpCenter" class="grid-item">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <view class="grid-icon sparrow-icon icon-cardbangzhuzhongxin"></view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <view class="grid-label">帮助中心</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </navigator>  */}
            <View className="grid-item"></View>
          </View>
        </View>
        {/*  <template is="tabbar" data="{{tabbar}}"/>  */}
        <View className="logout" onClick={this.userLogout}>
          退出登录
        </View>
        <View className="copy-right">
          北京汉光百货有限责任公司 © 2019 版权所有
        </View>
      </View>
    )
  }
}

export default _C
