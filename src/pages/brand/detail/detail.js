import { Block, View, Image, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../utils/util.js'
import GIO_utils from '../../../utils/GIO_utils.js'
import constant from '../../../config/constant.js'
import returnTop from '../../../component/returnTop/returnTop.js'
import returnToHome from '../../../component/returnToHome/returnToHome.js'
import getCouponModel from '../../../component/getCoupon/index.js'
import dialogService from '../../../component/dialog/dialogService.js'
import activeDetail from '../activity/activeDetail/activeDetail.js'
import brandInfo from '../introduction/introduction.js'
import selectItem from '../selectItem/selectItem.js'

import ReturnToHomeTmpl from '../../../imports/ReturnToHomeTmpl.js'
import ReturnTopTmpl from '../../../imports/ReturnTopTmpl.js'
import ProductListNewTmpl from '../../../imports/ProductListNewTmpl.js'
import SelectItemTmpl from '../../../imports/SelectItemTmpl.js'
import ActivityDetailTmpl from '../../../imports/ActivityDetailTmpl.js'
import BrandActivityTmpl from '../../../imports/BrandActivityTmpl.js'
import BrandIntroductionTmpl from '../../../imports/BrandIntroductionTmpl.js'
import './detail.scss'
const detail = {
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //品牌id

    // pageIndex: 0,
    // autoplay: true,
    // interval: 4000,
    // circular: true,
    // current: 0,
    productPage: 1, //商品页，默认为1，没有商品时为0
    brandProducts: [], //从后台请求得到的的商品信息
    isLoading: 'loading', //每次请求商品的显示情况
    printLogData: {}, // 向后台发送的数据
    arrangeItem: ['综合排序', '最新上架', '价格低到高', '价格高到低'],

    // navHeight: 0, //品牌详情导航到页面顶部的距离
    // countNum: 0, //用来标识是否存储筛选栏到顶部的距离，如果为0，则需要存储
    isScrollToTop: false, //商品列表是否要置顶，

    allSelectItem: false, //用来标识是否已经拿到品牌下的所有筛选项
    share_search: false, //是否是从分享的小程序里获取查询数据

    isShowSearch: false, //是否显示搜索框
    inputVal: '', //初始化输入数据
    isShowFocus: false //设置搜索框是否焦点
  },

  // productPage: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    //扫二维码进入
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    if (options.share_param) {
      wx.globalData.userSimpleInfo.share_param = options.share_param
    }

    // 从他人的转发中进入小程序
    if (options.share_search) {
      // 对转发的链接进行解密，获取相关参数
      const postObj = JSON.parse(decodeURIComponent(options.share_search))

      this.setData({
        postObj,
        share_search: true
        // fromShareData: postObj,
      })
    }

    this.data.printLogData = {
      source: 'wechat_app',
      action: 'go_to_brand',
      content: options.id
    }

    // 根据链接是否有from_share，判断是否能返回主页
    console.log(options)
    this.judgeAndShowReturnToHome(options)

    // 获取品牌信息
    this.data.id = options.id
    this.getBrandInfo(options.id)

    // 获取领券活动信息
    this.initGetCoupon('BRAND_DETAIL', this.data.id)

    // 初始化筛选项，从分享的小程序进来不需要初始化筛选项
    if (!this.data.share_search) {
      this.initTheSelectItem()
    }

    // 获取商品列表
    this.getBrandProductsList()

    // 获取屏幕高度
    this.getScreenHeight()
  },

  /**
   * 监听页面滚动
   */
  onPageScroll: function(e) {
    const _this = this
    this.judgeAndShowReturnTop(e)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const { source, action, content } = this.data.printLogData
    util.printLog(source, action, content)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // console.log("设置触底事件");
    this.getBrandProductsList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const obj_GIO = {
      sharePage_var: '品牌详情'
    }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    let postObj = this.data.postObj
    const title = postObj.keyword
    const id = this.data.id

    // 生成分享的链接需要带上筛选的内容
    let obj = encodeURIComponent(JSON.stringify(postObj))

    let url_options = {
      channel: '小程序分享',
      pageName: '品牌详情',
      goodsBrand: encodeURIComponent(this.data.mainBrand.name),
      id,
      share_search: obj
    }

    url_options = this.getCurrentPageParameterToShare(url_options)
    let new_url = util.return_current_url_with_options(url_options)

    return {
      title: title,
      path: new_url
    }
  },

  /**
   * 用户下拉刷新
   */
  onPullDownRefresh: function() {
    // 下拉刷新的过程中，筛选条件要保持不变
    this.setData({
      productPage: 1,
      brandProducts: []
    })
    // 获取商品列表
    this.getBrandProductsList()
  },

  /**
   * 初始化筛选条件
   * 从分享的小程序进来已经自带筛选条件，因此不需要执行此函数
   */
  initTheSelectItem: function() {
    //获取当前品牌id
    let brand_id = []
    brand_id.push(this.data.id)

    let postObj = {
      keyword: '', // 初始的搜索字
      page: 1,
      page_size: 20,
      sort: {
        default: ''
      },
      filters: {
        brand_id: brand_id, //指定品牌id
        filters: {}
      }
    }

    this.setData({
      postObj
    })
  },

  /**
   * 获得品牌在售商品列表
   */
  getBrandProductsList: function() {
    const _this = this

    const { productPage, postObj, share_search, id } = _this.data
    const pageNum = 20

    // 通过筛选的方式获得品牌的商品
    let data = {}

    //从分享进来的小程序需要请求两次商品链接
    //第一次为了获取所有筛选项，第二次为了获取商品
    //此处使用share_search来判断是否来自于分享的小程序，且是用来获取所有筛选项
    if (share_search) {
      let brand_id = []
      brand_id.push(id)
      data = {
        page_size: 20,
        filters: {
          brand_id: brand_id
        }
      }
    } else {
      postObj.page = productPage
      data = postObj
    }

    // console.log("productPage=", productPage);

    if (productPage) {
      util.request({
        url: constant.getBrandProductsList2,
        method: 'POST',
        hasToken: false,
        data: data,
        success: function(res) {
          if (productPage * pageNum >= res.total) {
            _this.data.productPage = 0
            if (res.total == 0) {
              _this.setData({
                isLoading: 'nothing'
              })
            } else {
              setTimeout(function() {
                _this.setData({
                  isLoading: 'nomore'
                })
              }, 500)
            }
          } else {
            _this.data.productPage = productPage + 1
            _this.setData({
              isLoading: 'loading'
            })
          }

          // 首次加载页面，需要获取到该品牌的筛选项
          if (!_this.data.allSelectItem) {
            _this.dataToTab(res.results.filters, res.total)
            _this.setData({
              allSelectItem: true
            })
          }

          if (!_this.data.share_search) {
            _this.getProductsSellStatus(res.results.products)
          }
        }
      })
    }
  },

  /**
   * 给数据加上库存状态
   */
  getProductsSellStatus: function(data) {
    // 得到所有商品id数组（用来查询库存）
    const allIds = this.getProductIds(data)
    const _this = this

    util.request({
      url: constant.getProductsSellStatus,
      method: 'POST',
      hasToken: false,
      data: {
        productmain_ids: allIds
      },
      success: function(res) {
        const onSellProductsIds = _this.getOnSellProductsIds(res.results)
        _this.handleBrandProductsListData(data, onSellProductsIds)
      }
    })
  },

  /**
   * 获得在售商品id合集
   */
  getOnSellProductsIds: function(data) {
    let onSellProductsIds = []

    data.forEach(function(product) {
      if (product.stock > 0) {
        onSellProductsIds.push(product.id)
      }
    })

    return onSellProductsIds
  },

  /**
   * 获取所有产品的所有id
   */
  getProductIds: function(data) {
    let allIds = []

    allIds = data.map(function(product) {
      return product.productmain_id
    })

    return allIds
  },

  /**
   * 处理品牌产品列表数据
   */
  handleBrandProductsListData: function(products, onSellIds) {
    // console.log(onSellIds);
    let { brandProducts, isScrollToTop } = this.data

    if (isScrollToTop) {
      brandProducts = []
    }
    // let brandProducts = [];
    for (let i = 0; i < products.length; i++) {
      let obj = {}
      const val = products[i]
      obj.originalPrice = val.original_price
      obj.retailPrice = val.display_price
      obj.title = val.name
      obj.id = val.id
      obj.activeArr = val.promotion_names
      obj.sellOut = false

      let processImage = val.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }
      obj.img = processImage

      // 加上库存状态
      if (onSellIds.indexOf(val.productmain_id) < 0) {
        obj.sellOut = true
      }

      brandProducts.push(obj)
    }

    // console.log("筛选后的数据：",brandProducts);
    this.setData({
      brandProducts
    })

    if (isScrollToTop) {
      this.getDistanceForTop()
    }
    Taro.hideToast()

    // 停止下拉刷新
    Taro.stopPullDownRefresh()
  },

  /**
   * 获取筛选栏到顶部的距离
   */
  getDistanceForTop: function() {
    const _this = this
    const isScrollToTop = _this.data.isScrollToTop
    let isShowSearch = _this.data.isShowSearch
    // 获取导航条到顶部的距离
    let distance_to_top = 0

    // 为了计算页面滚动距离
    let query_top = Taro.createSelectorQuery()
    // 选择器--品牌顶部介绍
    query_top.select('#brand-introduction').boundingClientRect()
    // 选择器--品牌的服务与活动
    query_top.select('#brand-activity').fields({
      size: true,
      rect: true,
      computedStyle: ['marginBottom']
    })
    // 选择器--筛选栏
    query_top.select('#select-top').boundingClientRect()
    // 选择器--搜索栏
    if (isShowSearch) {
      query_top.select('#search-nav-def').boundingClientRect()
    }

    query_top.exec(res => {
      // 获取到筛选栏与屏幕的距离
      distance_to_top = res[2].top

      // 获取到的margin-bottom结果为字符串，需要进行处理
      let str_bottom = res[1].marginBottom
      let num_bottom = parseInt(str_bottom.slice(0, str_bottom.length - 2))
      // 计算滚动距离
      // console.log("res[0].height=", res[0].height);
      // console.log("res[1].height=", res[1].height);
      let navHeight =
        res[0].height +
        (res[1].top - res[0].bottom) +
        res[1].height +
        num_bottom

      // 当有搜索框时候，需要对顶部进行设置存储筛选栏和搜索框的高度
      if (isShowSearch) {
        let select_height = res[2].height + res[3].height
        _this.setData(
          {
            select_height
          },
          () => _this.brandScrollPage(isScrollToTop, distance_to_top, navHeight)
        )
      } else {
        _this.setData(
          {
            select_height: 0
          },
          () => _this.brandScrollPage(isScrollToTop, distance_to_top, navHeight)
        )
      }
    })
  },

  /**
   * 页面滚动
   */
  brandScrollPage: function(isScrollToTop, distance_to_top, navHeight) {
    // 页面滚动
    if (isScrollToTop || distance_to_top !== 0) {
      // console.log("滚动距离", navHeight);
      Taro.pageScrollTo({
        scrollTop: navHeight,
        duration: 0
      })

      this.setData({
        isScrollToTop: false
      })
      Taro.hideToast()
    }
  },

  /**
   * 点击查看商品详情
   */
  linkToProductInfo: function(e) {
    const id = e.currentTarget.dataset.id
    Taro.navigateTo({
      url: '/packageA/product/detail/detail?id=' + id
    })
    // currentProduct.id
  },

  /**
   * 点击活动时，显示活动详情
   */
  activity_showActivityDesc: function() {
    this.turnToInfo(this.data.mainBrand.activity)
  }
}
const assignedObject = util.assignObject(
  detail,
  returnTop,
  returnToHome,
  getCouponModel,
  dialogService,
  activeDetail,
  brandInfo,
  selectItem
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '品牌详情'
  }

  render() {
    const {
      select_height: select_height,
      mainBrand: mainBrand,
      hasTab: hasTab,
      tab: tab,
      tabShow: tabShow,
      isShowSearch: isShowSearch,
      inputVal: inputVal,
      arrangeItem: arrangeItem,
      brandProducts: brandProducts,
      screenHeight: screenHeight,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome,
      all_promotion: all_promotion,
      showPromInfo: showPromInfo,
      isLoading: isLoading,
      dialogGetCoupon: dialogGetCoupon,
      user_hasToken: user_hasToken,
      SERVICE_PHONE: SERVICE_PHONE
    } = this.state
    return (
      <Block>
        <View className="main-brand">
          <View
            className="setForSearch"
            style={'height:' + select_height + 'px'}
          ></View>
          {/*  <view class="main-brand">  */}
          {/*  品牌介绍  */}
          <BrandIntroductionTmpl
            data={{
              brandInfo: (mainBrand, select_height)
            }}
          ></BrandIntroductionTmpl>
          {/*  品牌服务与活动  */}
          <BrandActivityTmpl
            data={{
              activity: mainBrand.activity
            }}
          ></BrandActivityTmpl>
          {/*  筛选  */}
          <SelectItemTmpl
            data={(hasTab, tab, tabShow, isShowSearch, inputVal, arrangeItem)}
          ></SelectItemTmpl>
          {/*  商品展示  */}
          {brandProducts.length > 0 && (
            <View id="product-detail-top">
              <ProductListNewTmpl
                data={(brandProducts, screenHeight)}
              ></ProductListNewTmpl>
            </View>
          )}
          {/*  置顶  */}
          <ReturnTopTmpl data={showReturnTop}></ReturnTopTmpl>
          <ReturnToHomeTmpl
            data={{
              showReturnToHome: showReturnToHome
            }}
          ></ReturnToHomeTmpl>
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
          {/*  服务说明  */}dialogService.show &&{' '}
          <View className="dialog-service">
            <View
              className="dialog-shade"
              onClick={this.handleCloseDialogService}
            ></View>
            {/* 弹框 */}
            <View className="dialog-service-box">
              <View className="dialog-service-head">
                <Text>服务说明</Text>
                <View
                  className="dialog-service-close"
                  onClick={this.handleCloseDialogService}
                >
                  <I className="sparrow-icon icon-close"></I>
                </View>
              </View>
              {/* 内容 */}
              <View className="dialog-service-content">
                <View className="dialog-list clearfix">
                  <View className="dialog-list-content">
                    <View className="dialog-list-title">
                      <View className="dialog-list-dot"></View>正品保障：
                    </View>
                    <View className="dialog-list-desc">
                      汉光百货官方购物网站、手机购物售出的产品，由汉光百货内各专柜提供正品保障。
                    </View>
                  </View>
                </View>
                <View className="dialog-list clearfix">
                  <View className="dialog-list-content">
                    <View className="dialog-list-title">
                      <View className="dialog-list-dot"></View>无忧售后：
                    </View>
                    <View className="dialog-list-desc">
                      由汉光百货官方购物网站、手机购物售出的产品，享受30天退换货服务（下文“退换货特别提示”所包含商品与情况除外）。消费者与客服沟通后，可选择邮寄或来店进行退换。
                    </View>
                  </View>
                </View>
                <View className="dialog-list clearfix">
                  <View className="dialog-list-content">
                    <View className="dialog-list-title">
                      <View className="dialog-list-dot"></View>极速退款：
                    </View>
                    <View className="dialog-list-desc">
                      消费者的订单在专柜完成配货前，如为整单退款，可申请快速退款，客服接到消费者通知后，将在20分钟内完成退款操作。银行卡退款到账时间，以各家银行规定为准。
                    </View>
                  </View>
                </View>
                <View className="dialog-list clearfix">
                  <View className="dialog-list-content">
                    <View className="dialog-list-title">
                      <View className="dialog-list-dot"></View>退换货特别提示：
                    </View>
                    <View className="dialog-list-desc">
                      我们非常抱歉的告知您，如存在以下特例，商品又不能确定存在质量缺陷，将无法办理退换货。
                      1.特例商品：若商品为贴身内衣、个人卫生用品、化妆品、金银珠宝、首饰、腕表、小家电，将无法进行退换货。2.特例情况：若存在产品或包装破损、残缺（含吊牌丢失）等影响二次销售的情况，退换货条款将依照国家相关法律法规执行。
                    </View>
                  </View>
                </View>
                <View className="dialog-list clearfix">
                  <View className="dialog-list-content">
                    <View className="dialog-list-title">
                      <View className="dialog-list-dot"></View>线上服务时间：
                    </View>
                    <View className="dialog-list-desc">
                      {'9:00-21:30\n国家法定节假日除外\n\n客服电话：' +
                        SERVICE_PHONE +
                        '\n客服微信：关注服务号“汉光小助手”，与在线客服沟通。'}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {showPromInfo && (
            <Block>
              <ActivityDetailTmpl
                data={{
                  all_promotion: all_promotion
                }}
              ></ActivityDetailTmpl>
            </Block>
          )}
        </View>
        {isLoading != '' && (
          <Block>
            <View className="list-foot no-padding-bottom">
              {isLoading == 'nothing' ? (
                <View className="no-product">
                  <View className="show_search_nothing">
                    <Image
                      src={require('../../../common/images/search_nothing.png')}
                    ></Image>
                  </View>
                  <Text>抱歉，没有找到相关商品</Text>
                </View>
              ) : isLoading == 'nomore' ? (
                <Block>没有更多了</Block>
              ) : (
                <Block>加载中...</Block>
              )}
            </View>
          </Block>
        )}
      </Block>
    )
  }
}

export default _C
