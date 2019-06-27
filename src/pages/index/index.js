import { Block, View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../utils/util.js'
// import qs from '../../utils/qs/index.js';
// import constant from '../../config/constant.js';
// import searchModule from './module/searchModule/searchModule.js';
// import swiperModule from './module/swiperModule/swiperModule.js';
// import freshModule from './module/freshModule/freshModule.js';
// import topicModule from './module/topicModule/topicModule.js';
// import flashsaleModule from './module/flashsaleModule/flashsaleModule.js';
// import hotBrandModule from './module/hotBrandModule/hotBrandModule.js';
// import hotProductModule from './module/hotProductModule/hotProductModule.js';
// import skuListModule from './module/skuListModule/skuListModule.js';
// import returnTop from '../../component/returnTop/returnTop.js';
// import getCouponModel from '../../component/getCoupon/index.js';

import grids from '../gridsNew/grids.js'
import GIO_utils from '../../utils/GIO_utils.js'
// import footer from '../footer/product.js';

import Csearch from '../../component/c-search/c-search'
import './index.scss'
const app = Taro.getApp()
const pageData = {
  /**
   * 页面的初始数据
   */
  // data: {
  //   // requestNum: 0, // 请求数量
  //   // requestSuccessNum: 0, // 请求成功数量
  //   tabbar:{}
  // },

  //   onLoad: function (options){
  //     //调用app中的函数
  //    app.changeTabBar();
  //  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function(options) {
  //  商品详情
  // wx.navigateTo({
  //   url: '/packageA/product/detail/detail?id=190605&share_param=xxx',
  // })
  // 品牌详情
  // wx.navigateTo({
  //   url: '/pages/brand/detail/detail?id=12&from_share=1&share_param=xxx',
  // })
  //  田字格
  // wx.navigateTo({
  //   url: '/packageA/jumpBridge/jumpBridge?jump_type=grids&from_share=1&share_param=xxx&id=3',
  // })
  //  电子屏订单
  // wx.navigateTo({
  //   url: '/packageA/jumpBridge/jumpBridge?jump_type=es&from_share=1&share_param=screen&products=(129,1)-(189768,1)-(129321,1)-(14535,1)',
  // });
  // 测试页
  // wx.navigateTo({
  //   url: '/pages/test/test?',
  // })
  // wx.navigateTo({
  //   url: '/packageA/flashsale/home/index?id=2',
  // })
  // 闪购详情页，flashshale_id是闪购期数id，id是商品id
  // wx.navigateTo({
  //   url: '/packageA/product/detail/detail?flashsale_id=&id=',
  // })
  // 闪购列表页,id是闪购期数
  // wx.navigateTo({
  //   url: '/packageA/flashsale/home/index?id=49&from_share=1&share_param=DYHTW',
  // })
  // wx.navigateTo({
  //   url: '/packageA/product/list/list',
  // })
  // wx.navigateTo({
  //   url: '/rfid/order/detail?id=110200&type=rfid&from_share=1',
  // })
  // wx.navigateTo({
  //   url: '/packageA/loginProtocol/loginProtocol',
  // })
  // wx.navigateTo({
  //   url: '/packageA/footer/product',
  // })
  // wx.navigateTo({
  //   url: '/packageA/topic/topic?topic=174',
  // })

  // this.initIndexData();
  // this.getScreenHeight();

  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // this.miniappsUpdateManager();
    util.printLog('wechat_app', 'go_to_homepage', '')

    // this.initGetCoupon()
  },

  /**
   * 管理更新
   */
  miniappsUpdateManager() {
    // 获取小程序更新机制兼容
    if (Taro.canIUse('getUpdateManager')) {
      const updateManager = Taro.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            Taro.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            // wx.showModal({
            //   title: '已经有新版本了哟~',
            //   content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            // });
          })
        }
      })
    }
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    else {
      // wx.showModal({
      //   title: '提示',
      //   content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      // });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function() {

  // let data = {
  //   requestNum: 0, // 请求数量
  //   requestSuccessNum: 0, // 请求成功数量
  //   flashsaleData: [],
  //   freshData: [],
  //   hotBrandData: [],
  //   hotProductData: [],
  //   shopShow: true, // 列表显示
  //   inputShowed: false, // 搜索栏
  //   inputVal: "", // 搜索栏上填写的数据
  //   search_big_div: {
  //     background: "rgba(255,255,255,0)", // rgba(255,255,255,0) -> rgba(255,255,255,1)
  //     padding: "206rpx", // 206rpx -> 60rpx
  //   },
  //   search_bar_form: {
  //     color: "rgb(255, 255, 255)", // rgb(255, 255, 255) -> rgb(69, 69, 69)
  //     background: "rgba(0, 0, 0, 0.3)", // rgba(0, 0, 0, 0.3) -> rgba(238, 238, 238, 1)
  //   },
  //   skuListData: [],
  //   // promotions: [],
  //   nextPage: '',
  //   skuArrLength: 20,
  //   isLoading: '',
  //   swiperData: [],
  //   current: 0,
  //   topicData: [],
  //   dialogGetCoupon: {
  //     show: false,
  //     auth_status: null,
  //     couponHome: {},
  //     coupons: [],
  //     loginUrl: '/vendingMachine/login/login',
  //   },
  // };

  // this.data = data;

  // this.initIndexData();
  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    // 首页分享给GIO发送信息
    // GP的分享不在这写（首页分享，GIO有坑，会发两次，所以单独写到index的分享函数里）
    const obj_GIO = { sharePage_var: '首页' }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    const url_options = {
      channel: '小程序分享',
      pageName: '首页'
    }
    let new_url = util.return_current_url_with_options(url_options)

    return {
      path: new_url
    }
  }

  /**
   * 初始化首页数据
   */
  // initIndexData: function() {
  //   //获得焦点图信息
  //   this.getSwiperData(util.request, constant.getSwiperData, constant.imageSuffix.focus, util.needPrecssImage);
  //   //获热搜品类的信息
  //   this.getHotProductData(util.request, constant.getHotProductData);
  //   //获新品上架信息
  //   this.getFreshData(util.request, constant.getFreshData, constant.imageSuffix.squareS, util.needPrecssImage);
  //   //获闪购特惠的信息
  //   this.getFlashsaleData(util.request, constant.getFlashsaleData, constant.imageSuffix.squareS, util.needPrecssImage);
  //   //获活动推荐的信息
  //   this.getTopicData(util.request, constant.getTopicData, constant.imageSuffix.topic, util.needPrecssImage);
  //   //获热门品牌的信息
  //   this.getHotBrandData(util.request, constant.getHotBrandData, constant.imageSuffix, util.needPrecssImage);
  //   //获热销单品的信息
  //   this.data.nextPage = constant.getSkuListData;
  //   this.getSkuListData(util.request, constant.imageSuffix.squareM, util.needPrecssImage);
  //   // 获取领券活动信息
  //   // this.initGetCoupon();
  // },

  /**
   * 添加 决定小菊花是否显示 的请求数量,并显示小菊花
   */
  // addRequestNum: function() {

  //   this.data.requestNum++;
  // },

  /**
   * 判断 如果决定小菊花是否显示的请求数量 == 决定小菊花是否显示的请求成功数量，那么取消小菊花
   */
  // judgeRequestSuccess: function() {

  //   this.data.requestSuccessNum++;
  //   if (this.data.requestNum == this.data.requestSuccessNum) {
  //     wx.stopPullDownRefresh();
  //   }
  // },

  /**
   * 监听用户滚动页面
   */
  // onPageScroll: function(e) {

  //   const scrollTop = e.scrollTop;
  //   let {
  //     search_big_div,
  //     search_bar_form
  //   } = this.data;

  //   if (scrollTop <= 8) {

  //     search_big_div.background = "rgba(255, 255, 255, 0)";
  //     search_big_div.padding = "206rpx";
  //     search_bar_form.color = "rgb(255, 255, 255)";
  //     search_bar_form.background = "rgba(0, 0, 0, 0.3)";
  //   } else if (scrollTop <= 16) {

  //     search_big_div.background = "rgba(255, 255, 255, 0.2)";
  //     search_big_div.padding = "176rpx";
  //     search_bar_form.color = "rgb(218, 218, 218)";
  //     search_bar_form.background = "rgba(48, 48, 48, 0.4)";
  //   } else if (scrollTop <= 24) {

  //     search_big_div.background = "rgba(255, 255, 255, 0.4)";
  //     search_big_div.padding = "146rpx";
  //     search_bar_form.color = "rgb(181, 181, 181)";
  //     search_bar_form.background = "rgba(96, 96, 96, 0.5)";
  //   } else if (scrollTop <= 32) {

  //     search_big_div.background = "rgba(255, 255, 255, 0.6)";
  //     search_big_div.padding = "116rpx";
  //     search_bar_form.color = "rgb(144, 144, 144)";
  //     search_bar_form.background = "rgba(144, 144, 144, 0.6)";
  //   } else if (scrollTop <= 40) {

  //     search_big_div.background = "rgba(255, 255, 255, 0.8)";
  //     search_big_div.padding = "86rpx";
  //     search_bar_form.color = "rgb(107, 107, 107)";
  //     search_bar_form.background = "rgba(192, 192, 192, 0.7)";
  //   } else {

  //     search_big_div.background = "rgba(255, 255, 255, 1)";
  //     search_big_div.padding = "60rpx";
  //     search_bar_form.color = "rgb(69, 69, 69)";
  //     search_bar_form.background = "rgba(238, 238, 238, 1)";
  //   }

  //   this.scrollPage(search_big_div, search_bar_form);

  //   this.judgeAndShowReturnTop(e);

  // },

  /**
   * 跳转到对应页面
   */
  // navigateToPage: function(url) {

  //   wx.navigateTo({
  //     url: url,
  //   });
  // },

  // 跳转到自动售货机下单页面
  // btnGotoVendingMachineBuy: function() {
  //   this.navigateToPage('/vendingMachine/buy/buy?order_id=1535082721579&product_id=1&app_id=app_1534851431&timestamp=1535082721&nonce=5cf462b91bbf4d2f86fd70472c3b3c2b&sign=B7899C749255EBD404F175E53AF150C1');
  // },
  // 跳转到自动售货机登录页面
  // btnGotoVendingMachineLogin: function() {
  //   this.navigateToPage('/vendingMachine/login/login');
  // },
  //跳转到订单详情
  // btnGotoVendingMachineOrder: function() {
  //   this.navigateToPage('/vendingMachine/order/detail?id=5974');
  // },
}

const assignObject = util.assignObject(
  // getCouponModel,
  grids,
  pageData
  //   searchModule,
  //   swiperModule,
  //   freshModule,
  //   topicModule,
  //   flashsaleModule,
  //   hotBrandModule,
  //   hotProductModule,
  //   skuListModule,
  //   returnTop,
  // footer
)

@withWeapp('Page', assignObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '汉光购物',
    enablePullDownRefresh: true,
    onReachBottomDistance: 50,
    backgroundColorTop: '#fff'
  }

  render() {
    const {
      anchorText: anchorText,
      scroll_view_height: scroll_view_height,
      backgroundColor: backgroundColor,
      scrollTop: scrollTop,
      backgroundImage: backgroundImage,
      gridsRows: gridsRows,
      rowIndex: rowIndex,
      rowItem: rowItem,
      gridsData: gridsData,
      productRow: productRow,
      productList: productList,
      topicProductsList: topicProductsList,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome,
      dialogGetCoupon: dialogGetCoupon,
      user_hasToken: user_hasToken
    } = this.state
    return (
      <View className="page">
        <Block>
          {/*  <import src="../../component/tabbar/tabbar.wxml" />  */}
          <ScrollView
            scrollWithAnimation
            enableBackToTop
            scrollY="true"
            scrollIntoView={anchorText}
            id="product-detail-top"
            style={
              'height: ' +
              scroll_view_height +
              '; background-color: ' +
              backgroundColor +
              ';'
            }
            onScroll={this.scrollView}
            scrollTop={scrollTop}
            upperThreshold="1"
            lowerThreshold="1"
            onScrollToUpper={this.scroll_to_top}
            onScrollToLower={this.scroll_to_bottom}
          >
            <View
              style={'background-image: url(' + backgroundImage + ');'}
              className="background-normal"
            >
              {gridsRows.map((rowItem, rowIndex) => {
                return (
                  <Block key={'grids-row-' + rowIndex}>
                    {/*  这里有个坑：只能用一个搜索框，因为田字格大页写了固定的id用于页面的页面滚动事件后调用组件的方法，而一个页面的id最多只有一个（其实后续可以用rowId，但是配合这个还需要写其他东西，所以一期先只能用一个）  */}
                    {rowItem.nodeType == 'search' ? (
                      <Block>
                        <Csearch
                          id="c-search"
                          iconSearch="sparrow-icon icon-search"
                          placeholder={gridsData[rowItem.item[0]].placeholder}
                          url={gridsData[rowItem.item[0]].url}
                          data-index={rowIndex}
                          onClick={this.click_gp_search}
                        ></Csearch>
                      </Block>
                    ) : rowItem.nodeType == 'image' ? (
                      <Block>
                        <DisplayImageTmpl
                          data={{
                            imgRow: (rowItem, gridsData)
                          }}
                        ></DisplayImageTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'navi' ? (
                      <Block>
                        <DisplayNavbarTmpl
                          data={{
                            navbarRow: (rowItem, gridsData)
                          }}
                        ></DisplayNavbarTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'space' ? (
                      <Block>
                        <EmptyContentTmpl
                          data={{
                            emptyRow: rowItem
                          }}
                        ></EmptyContentTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'swiper' ||
                      rowItem.nodeType == 'focus' ? (
                      <Block>
                        <DisplayImageCarouselTmpl
                          data={{
                            imageCarouselRow: (rowItem, gridsData)
                          }}
                        ></DisplayImageCarouselTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'video' ? (
                      <Block>
                        <ShowVideoTmpl
                          data={{
                            videoRow: rowItem
                          }}
                        ></ShowVideoTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'brand' ? (
                      <Block>
                        <BrandListTmpl
                          data={{
                            hotBrandRow: (rowItem, gridsData)
                          }}
                        ></BrandListTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'products' ? (
                      <Block>
                        {(rowItem.displayType == 'waterfall_2' ||
                          rowItem.displayType == 'waterfall_3') && (
                          <DisplayProductListTmpl
                            data={{
                              type: (rowItem.displayType, productRow)
                            }}
                          ></DisplayProductListTmpl>
                        )}
                        {/*  横向滚动  */}
                        {rowItem.displayType == 'scroll_view' ? (
                          <DisplayProductScrollTmpl
                            data={{
                              productRow: (rowItem, productList)
                            }}
                          ></DisplayProductScrollTmpl>
                        ) : (
                          (rowItem.displayType == 'swiper_2' ||
                            rowItem.displayType == 'swiper_3' ||
                            rowItem.displayType == 'swiper_6') && (
                            <DisplayProductCarouselTmpl
                              data={{
                                productRow: (rowItem, productList)
                              }}
                            ></DisplayProductCarouselTmpl>
                          )
                        )}
                        {/*  2件轮播,3件轮播，6件轮播  */}
                      </Block>
                    ) : rowItem.nodeType == 'topic' ? (
                      <Block>
                        <PromotionListTmpl
                          data={{
                            topicRow: (rowItem, topicProductsList)
                          }}
                        ></PromotionListTmpl>
                      </Block>
                    ) : (
                      rowItem.nodeType == 'brandwall' && (
                        <Block>
                          <BrandWallTmpl
                            data={{
                              brandWall: (rowItem, gridsData)
                            }}
                          ></BrandWallTmpl>
                        </Block>
                      )
                    )}
                    {/*  图片  */}
                    {/*  导航  */}
                    {/*  辅助空白  */}
                    {/*  轮播：焦点图  */}
                    {/*  video  */}
                    {/*  品牌列表  */}
                    {/*  商品类型  */}
                    {/*  专题类型  */}
                    {/*  品牌墙  */}
                  </Block>
                )
              })}
              {/*  图片  */}
              {/*  <template is="displayImage" data="{{chunkArr: row.item, gridsData: gridsData}}"></template>  */}
              {/*  商品：2、3件瀑布流  */}
              {/*  <template is="displayProductList" data="{{productList3: productList3}}"></template>  */}
              {/*  商品：横向滑动  */}
              {/*  <template is="displayProductScroll" data="{{productList3: productList3}}"></template>  */}
              {/*  中间固定导航  */}
              {/*  <template is="displayNavbar" data="{{navbarImg: navbarImg, type:'absolute'}}"></template>  */}
              {/*  轮播  */}
              {/*  <template is="displayProductCarousel" data="{{productCarouselList6: productCarouselList6, productCarouselList2: productCarouselList2, productCarouselList3: productCarouselList3,currentSwiper: 1}}"></template>  */}
              {/*  顶部固定导航  */}
              {/*  <template is="displayNavbar" data="{{navbarImg: navbarImg, type:'top-fixed'}}"></template>  */}
              {/*  底部固定导航  */}
              {/*  <template is="displayNavbar" data="{{navbarImg: navbarImg, type:'bottom-fixed'}}"></template>  */}
              {/*  辅助空白  */}
              {/*  <template is="emptyContent" data="{{height: '3000rpx',backgroundColor: '#ccc', backgroundImg: 'https://img-backend.hanguangbaihuo.com/media%2Fshop_image%2FIMG_7080.JPG'}}"></template>  */}
              {/*  video  */}
              {/*  <template is="showVideo" data="{{videoSrc: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'}}"></template>  */}
              {/*  搜索  */}
              {/*  <template is="showSearch" data="{{search_big_div: search_big_div, search_bar_form: search_bar_form, inputVal: inputVal, inputShowed: inputShowed}}"></template>  */}
              {/*  品牌推荐  */}
              {/*  <template is="brandList" data="{{hotBrandData: hotBrandData, backgroundColor: '#ccc', backgroundImg: 'https://img-backend.hanguangbaihuo.com/media%2Fshop_image%2FIMG_7080.JPG'}}"></template>  */}
              {/*  活动列表  */}
              {/*  <template is="promotionList" data="{{promotionData: promotionData}}"></template>  */}
              {/*  轮播：焦点图  */}
              {/*  <template is="displayImageCarousel" data="{{swiperData: swiperData}}"></template>  */}
              {/*  <template is="emptyContent" data="{{height: '200rpx',backgroundColor: '#ccc', backgroundImg: 'https://img-backend.hanguangbaihuo.com/media%2Fshop_image%2FIMG_7080.JPG'}}"></template>  */}
            </View>
          </ScrollView>
          {showReturnTop && (
            <View className="return-top" onClick={this.clickToScrollTop}>
              <I className="sparrow-icon icon-return-top"></I>
            </View>
          )}
          <ReturnToHomeTmpl
            data={{
              showReturnToHome: showReturnToHome
            }}
          ></ReturnToHomeTmpl>
          {/*  <template is="tabbar" data="{{tabbar}}"/>  */}
          {/*  <block wx:if="{{isLoading!=''}}">
                                                                                        <view class="list-foot">
                                                                                          <block wx:if="{{isLoading=='nomore'}}">没有更多了</block>
                                                                                          <block wx:else>加载中...</block>
                                                                                        </view>
                                                                                      </block>  */}
          {/*  <template is="displayNavbar" data="{{navbarRow: gridsRows[8], gridsData: gridsData}}"></template>  */}
          {/*  领券  */}
          <Block>
            {/*  两个品牌+两张优惠券  */}
            {/*  一个品牌+一张优惠券  */}
            {/*  一个品牌+两张优惠券  */}
            {/*  一个品牌+零张优惠券  */}
            {dialogGetCoupon.show && (
              <View className="dialog-getCoupon">
                <View className="dialog-shade"></View>
                {/* 弹框 */}
                <View
                  className="dialog-getCoupon-box"
                  onClick={this.handleCloseDialogGetCoupon}
                >
                  {/*  展示两个品牌+两张优惠券  */}
                  {dialogGetCoupon.couponHome.style == 'TwoBrandTwoCoupon' ? (
                    <Block>
                      <CouponStyleaTmpl
                        data={(dialogGetCoupon, user_hasToken)}
                      ></CouponStyleaTmpl>
                    </Block>
                  ) : dialogGetCoupon.couponHome.style ==
                    'OneBrandOneCoupon' ? (
                    <Block>
                      <CouponStylebTmpl
                        data={(dialogGetCoupon, user_hasToken)}
                      ></CouponStylebTmpl>
                    </Block>
                  ) : dialogGetCoupon.couponHome.style ==
                    'OneBrandTwoCoupon' ? (
                    <Block>
                      <CouponStylecTmpl
                        data={(dialogGetCoupon, user_hasToken)}
                      ></CouponStylecTmpl>
                    </Block>
                  ) : (
                    dialogGetCoupon.couponHome.style == 'OneBrandNoCoupon' && (
                      <Block>
                        <CouponStyledTmpl
                          data={dialogGetCoupon}
                        ></CouponStyledTmpl>
                      </Block>
                    )
                  )}
                  {/*  展示一个品牌+一张优惠券  */}
                  {/*  展示一个品牌+两张优惠券  */}
                  {/*  展示一个品牌+零张优惠券  */}
                </View>
              </View>
            )}
          </Block>
        </Block>
        {/*  <include src="../footer/product.wxml" />  */}
        <View className="index-content">
          {/*  <include src='module/searchModule/searchModule.wxml' />  */}
          {/*  轮播图  */}
          {/*  <include src='module/swiperModule/swiperModule.wxml' />  */}
          {/*  热搜品类  */}
          {/*  <view class='scroll-item' wx:if="{{hotProductData.length > 0}}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             <view class='scroll-title'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <text class='left'>热搜品类</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <text class='right' bindtap='moreHotProduct'>查看更多</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             <include src="module/hotProductModule/hotProductModule.wxml" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           </view>  */}
          {/*  新草必拔  */}
          {/*  <view class='scroll-item' wx:if="{{freshData.length > 0}}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <view class='scroll-title'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <text class='left'>新草必拔</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <text class='right' bindtap='freshMore'>查看更多</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <scroll-view class="scroll-view_H first height-390" scroll-x='true'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <include src="module/freshModule/freshModule.wxml" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </scroll-view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </view>  */}
          {/*  闪购特惠  */}
          {/*  <view class='scroll-item' wx:if="{{flashsaleData.length > 0}}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           <view class='scroll-title'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             <text class='left'>闪购囤货</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             <text class='right' bindtap='moreFlashsale'>查看更多</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           <scroll-view class="scroll-view_H flashsale" scroll-x='true'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             <include src="module/flashsaleModule/flashsaleModule.wxml" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           </scroll-view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         </view>  */}
          {/*  活动推荐  */}
          {/*  <view class='scroll-item' wx:if="{{topicData.length > 0}}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <view class='scroll-title'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <text class='left'>剁手灵感</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <text class='right' bindtap='moreTopic'>查看更多</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <scroll-view class="scroll-view_H topic" scroll-x='true'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <include src="module/topicModule/topicModule.wxml" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </scroll-view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </view>  */}
          {/*  热门品牌  */}
          {/*  <view class='scroll-item' wx:if="{{hotBrandData.length > 0}}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         <view class='scroll-title'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           <text class='left'>热门品牌</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           <text class='right' bindtap='moreHotBrand'>查看更多</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         <scroll-view class="scroll-view_H hotBrand" scroll-x='true'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           <include src="module/hotBrandModule/hotBrandModule.wxml" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         </scroll-view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       </view>  */}
          {/*  热销单品  */}
          {/*  <view class='scroll-item' wx:if="{{skuListData.length > 0}}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <view class='scroll-title'>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <text class='left'>热销单品</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <include src="module/skuListModule/skuListModule.wxml" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </view>  */}
        </View>
        {/*  领券  */}
        <Block>
          {/*  两个品牌+两张优惠券  */}
          {/*  一个品牌+一张优惠券  */}
          {/*  一个品牌+两张优惠券  */}
          {/*  一个品牌+零张优惠券  */}
          {dialogGetCoupon.show && (
            <View className="dialog-getCoupon">
              <View className="dialog-shade"></View>
              {/* 弹框 */}
              <View
                className="dialog-getCoupon-box"
                onClick={this.handleCloseDialogGetCoupon}
              >
                {/*  展示两个品牌+两张优惠券  */}
                {dialogGetCoupon.couponHome.style == 'TwoBrandTwoCoupon' ? (
                  <Block>
                    <CouponStyleaTmpl
                      data={(dialogGetCoupon, user_hasToken)}
                    ></CouponStyleaTmpl>
                  </Block>
                ) : dialogGetCoupon.couponHome.style == 'OneBrandOneCoupon' ? (
                  <Block>
                    <CouponStylebTmpl
                      data={(dialogGetCoupon, user_hasToken)}
                    ></CouponStylebTmpl>
                  </Block>
                ) : dialogGetCoupon.couponHome.style == 'OneBrandTwoCoupon' ? (
                  <Block>
                    <CouponStylecTmpl
                      data={(dialogGetCoupon, user_hasToken)}
                    ></CouponStylecTmpl>
                  </Block>
                ) : (
                  dialogGetCoupon.couponHome.style == 'OneBrandNoCoupon' && (
                    <Block>
                      <CouponStyledTmpl
                        data={dialogGetCoupon}
                      ></CouponStyledTmpl>
                    </Block>
                  )
                )}
                {/*  展示一个品牌+一张优惠券  */}
                {/*  展示一个品牌+两张优惠券  */}
                {/*  展示一个品牌+零张优惠券  */}
              </View>
            </View>
          )}
        </Block>
        {/*  <template is="tabbar" data="{{tabbar}}"/>  */}
      </View>
    )
  }
}

export default _C
