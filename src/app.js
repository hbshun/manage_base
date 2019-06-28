import { Block } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
//app.js

import util from './utils/util.js'
import qs from './utils/qs/index.js'
import constant from './config/constant.js'
import gio from './utils/growingio/gio-minp.js'
import GIO_utils from './utils/GIO_utils.js'

import './app.scss'
gio('init', '9b7076f9688924d3', 'wx5c8a9897143b0cf8', {
  version: '3.1.190618',
  forceLogin: false,
  debug: false,
  followShare: true
})

class App extends Taro.Component {
  timer = false
  componentWillMount = options => {
    // 全局变量，存储数据
    wx.globalData = Object.create(null)
    wx.globalData.phone = ''
    wx.globalData.gotoUrl = ''
    wx.globalData.user_from = null
    wx.globalData.has_birthday = false
    // growing IO
    wx.globalData.gio = gio
    // 全局变量，存储登录状态，默认 completed 请求完成，loading 请求中，此时不允许发起新请求
    wx.loginStatus = 'completed'
    // 全局变量，存储登录中 loading 的请求状态，当请求完成 completed 时，发起请求
    wx.requestArr = []

    wx.globalData.userSimpleInfo = {}
    wx.globalData.userSimpleInfo.virtualOpenId = '' // 打开小程序的用户的虚拟openId
    wx.globalData.userSimpleInfo.phone = '' // 打开小程序的用户手机号
    wx.globalData.userSimpleInfo.share_param = '' // 分享参数，用于地主判断从哪个大号打开小程序
    wx.globalData.userSimpleInfo.wechat_app_id = '' // 如果是从公众号打开的小程序，这个地方存储的是公众号appId

    if (options) {
      if (options.scene) {
        const scene = options.scene
        if (
          scene == 1020 ||
          scene == 1035 ||
          scene == 1036 ||
          scene == 1037 ||
          scene == 1038 ||
          scene == 1043
        ) {
          wx.globalData.userSimpleInfo.wechat_app_id =
            options.referrerInfo.appId
        }
      }
    }
    this.getUserSimpleInfo()
    this.judge_status_GIO()
    this.getCart()
    //每50毫秒取一次购物车商品数量
    this.timer = setInterval(() => {
      this.handleCart()
    }, 100)
  }
  getUserSimpleInfo = () => {
    Taro.login({
      success: res => {
        if (res.code) {
          let header = {}
          header['Cache-Control'] = 'no-cache'
          Taro.request({
            header: header,
            url: constant.getVirtualOpenId,
            method: 'POST',
            data: {
              app_id: constant.appId,
              wechat_app_code: res.code
            },
            success: function(res) {
              if (res.data) {
                const data = res.data
                if (data.anonymous_id) {
                  wx.globalData.userSimpleInfo.virtualOpenId = data.anonymous_id
                }
                if (data.phone) {
                  wx.globalData.userSimpleInfo.phone = data.phone
                }
              }
              // console.log(wx.globalData.userSimpleInfo);
            }
          })
        }
      },
      fail: err => {}
    })
  }
  judge_status_GIO = () => {
    const _this = this
    util.request({
      url: constant.switch_GIO,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        const flag = res.is_gio_available || false
        const time = res.gio_switch_refresh || 60000
        gio('setStopTrack', !flag)
        setTimeout(() => {
          _this.judge_status_GIO()
        }, time)
      }
    })
  }
  globalData = {
    userInfo: null
  }
  componentDidShow = () => {
    GIO_utils.set_login_user_info_GIO()
    // wx.setTabBarBadge({//这个方法的意思是，为小程序某一项的tabbar右上角添加文本
    //   index: 3,   //代表哪个tabbar（从0开始）
    //   text: '1'		//显示的内容
    // })
  }
  handleCart = () => {
    let cart_num = Taro.getStorageSync('cart_num') || 0
    if (cart_num == 0) {
      Taro.removeTabBarBadge({
        //购物车为空 ，移除购物车的tabar右上角添加购物车数量标志
        index: 3
      })
      return
    }
    Taro.setTabBarBadge({
      //购物车不为空 ，给购物车的tabar右上角添加购物车数量标志
      index: 3, //标志添加位置
      text: `${cart_num}`
    })
  }
  getCart = () => {
    util.request({
      url: constant.getCartProductNum,
      method: 'GET',
      success: function(data) {
        let all_num = 0
        all_num = data.quantity__sum
        Taro.setStorageSync('cart_num', all_num)
      }
    })
  }
  config = {
    pages: [
      'pages/index/index',
      'pages/logs/logs',
      'pages/cart/index/index',
      'pages/cart/modifyPromotions/modifyPromotions',
      'pages/login/login',
      'pages/help/index',
      'pages/success/order-pay-success',
      'pages/error/error',
      'pages/success/success',
      'pages/category/category',
      'pages/searchPage/searchPage',
      'pages/brand/detail/detail',
      'pages/brand/index/index',
      'pages/brand/letter/letter',
      'pages/fromMiniAppCode/fromMiniAppCode',
      'pages/test/test',
      'pages/gridsNew/index',
      'pages/usercenter/index/index',
      'pages/usercenter/components/onlineOrders/components/orderList/index',
      'pages/usercenter/components/onlineOrders/components/orderDetail/index',
      'pages/usercenter/components/onlineOrders/components/orderDetail/assignment/assignment',
      'pages/usercenter/components/onlineOrders/components/orderDetail/assignmentTrace/assignmentTrace',
      'pages/usercenter/components/moreServices/components/helpCenter/helpCenter',
      'pages/usercenter/components/moreServices/components/changePhone/changePhone',
      'pages/usercenter/components/storeServices/components/userEquity/index',
      'pages/usercenter/components/storeServices/components/shoppingRecord/index',
      'pages/usercenter/components/storeServices/components/parkingPayment/index',
      'pages/usercenter/components/storeServices/components/shoppingRecord/components/OrderDetail/index',
      'pages/usercenter/components/userInfo/components/parkingCouponList/index',
      'pages/usercenter/components/userInfo/components/couponList/index',
      'pages/usercenter/complementInformation/index',
      'pages/usercenter/invoiceOpening/index',
      'pages/usercenter/invoiceOpening/components/fillInInvoiceInfo/index',
      'pages/usercenter/invoiceOpening/components/invoicedSucess/index',
      'pages/usercenter/invoiceOpening/components/invoiceTitleManage/index',
      'pages/usercenter/invoiceOpening/components/invoiceDetail/index',
      'pages/usercenter/invoiceOpening/components/editInvoiceTitleInfo/index',
      'pages/usercenter/invoiceOpening/components/addInvoiceTitleInfo/index',
      'pages/usercenter/InvoiceInfo/index',
      'pages/usercenter/membershipCard/index',
      'pages/usercenter/components/userInfo/components/cashGiftDetail/index',
      'pages/usercenter/components/storeServices/components/parkingPayment/components/ParkingInfo/index',
      'pages/usercenter/components/storeServices/components/parkingPayment/components/BindNewLicensePlate/index'
    ],
    subPackages: [
      {
        root: 'packageA',
        pages: [
          'product/list/list',
          'product/detail/detail',
          'product/productClose/productClose',
          'flashsale/home/index',
          'flashsale/buy/buy',
          'topic/topic',
          'fresh/fresh',
          'topicList/topicList',
          'order/order',
          'order/pages/allMerchandise/allMerchandise',
          'order/pages/chooseAddress/chooseAddress',
          'order/pages/addAddress/addAddress',
          'grids/grids',
          'jumpBridge/jumpBridge',
          'loginProtocol/loginProtocol'
        ]
      },
      {
        root: 'vendingMachine',
        pages: ['login/login', 'buy/buy', 'order/detail']
      },
      {
        root: 'electronicScreen',
        pages: ['buy/buy', 'order/detail']
      },
      {
        root: 'rfid',
        pages: ['buy/buy', 'order/detail']
      }
    ],
    window: {
      backgroundTextStyle: 'dark',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '汉光购物',
      navigationBarTextStyle: 'black',
      backgroundColor: '#f7f7f7',
      enablePullDownRefresh: true
    },
    debug: false,
    tabBar: {
      list: [
        {
          pagePath: 'pages/index/index',
          text: '线上购物',
          iconPath: 'image/tabBarIcon/icon-home.png',
          selectedIconPath: 'image/tabBarIcon/icon-home-red.png'
        },
        {
          pagePath: 'pages/category/category',
          text: '分类',
          iconPath: 'image/tabBarIcon/icon-category.png',
          selectedIconPath: 'image/tabBarIcon/icon-category-red.png'
        },
        {
          pagePath: 'pages/brand/index/index',
          text: '品牌',
          iconPath: 'image/tabBarIcon/icon-brand.png',
          selectedIconPath: 'image/tabBarIcon/icon-brand-red.png'
        },
        {
          pagePath: 'pages/cart/index/index',
          text: '购物车',
          iconPath: 'image/tabBarIcon/icon-cart.png',
          selectedIconPath: 'image/tabBarIcon/icon-cart-red.png'
        },
        {
          pagePath: 'pages/usercenter/index/index',
          text: '会员中心',
          iconPath: 'image/tabBarIcon/icon-mine.png',
          selectedIconPath: 'image/tabBarIcon/icon-mine-red.png'
        }
      ],
      color: '#999',
      selectedColor: '#b31b1b'
    },
    navigateToMiniProgramAppIdList: ['wx26875c5baf27b8b0'],
    sitemapLocation: 'sitemap.json'
  }

  componentWillMount() {
    this.$app.globalData = this.globalData
  }

  render() {
    return null
  }
}

export default App
Taro.render(<App />, document.getElementById('app'))
