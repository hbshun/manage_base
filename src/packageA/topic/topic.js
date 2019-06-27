import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import returnTop from '../../component/returnTop/returnTop.js'
import returnToHome from '../../component/returnToHome/returnToHome.js'
import GIO_utils from '../../utils/GIO_utils.js'

import ReturnToHomeTmpl from '../../imports/ReturnToHomeTmpl.js'
import ReturnTopTmpl from '../../imports/ReturnTopTmpl.js'
import ShopItembTmpl from '../../imports/ShopItembTmpl.js'
import './topic.scss'
const topicPage = {
  /**
   * 页面的初始数据
   */
  data: {
    displayType: '', // MIX: 不分栏；BRAND: 按品牌分栏；CATEGORY: 按分类分栏
    image: '', // 主图地址
    tabItem: [], // 专题页面的条目，有可能为空，有可能是品牌名，有可能是分类名
    productData: [], // 所有的商品数据
    showProductData: [], //当前展示的所有商品数据
    dateResidue: '', //活动剩余的时间
    endTime: '',
    tabCurrent: '全部', // 当前的品牌
    showDropDownList: false, // 下拉列表是否显示
    isLoading: true,
    topicId: 0 // 专题id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    const topicId = options.topic
    this.data.topicId = topicId

    if (options.share_param) {
      wx.globalData.userSimpleInfo.share_param = options.share_param
    }

    this.judgeAndShowReturnToHome(options)
    this.getTopicProductData(topicId)
    this.getScreenHeight()
  },

  /**
   * 监听页面滚动
   */
  onPageScroll: function(e) {
    this.judgeAndShowReturnTop(e)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const topicId = this.data.topicId
    util.printLog('wechat_app', 'go_to_cuthand', topicId)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.timer)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const obj_GIO = {
      sharePage_var: '专题页'
    }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    let url_options = {
      channel: '小程序分享',
      pageName: '专题页'
    }
    url_options = this.getCurrentPageParameterToShare(url_options)
    let new_url = util.return_current_url_with_options(url_options)

    return {
      path: new_url
    }
  },

  /**
   * 获得专题页面数据
   */
  getTopicProductData: function(topicId) {
    const _this = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.getTopicProductData + topicId,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        Taro.hideToast()
        // _this.getProductsSellStatus(res.productmain_id_list, res);
        _this.handleData(res)
        _this.setData({
          isLoading: false
        })
      }
    })
  },

  /**
   * 处理活动数据API返回的数据
   */
  handleData: function(data) {
    const displayType = data.display_type
    const onSellIds = data.productmain_id_list
    let tabItem = [] // data.display_type == 'MIX'时候不分类

    let processImage = data.image
    if (util.needPrecssImage(processImage)) {
      processImage = processImage + constant.imageSuffix.focus
    }

    // 处理products成指定格式并且让售罄的放到最后

    let productData = [] // 存的是整理过的有货的product完整数据（之后会合并售罄的，目的是售罄的放到最后）
    let sellOutProduct = [] // 存的是售罄的product完整数据
    for (let i = 0; i < data.products.length; i++) {
      let product = data.products[i]
      let obj = {}

      let processImage = product.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }

      obj.img = processImage
      obj.originalPrice = product.original_price
      obj.retailPrice = product.display_price
      obj.title = product.brand + ' ' + product.name
      obj.id = product.id
      obj.activeArr = product.promotion_names
      obj.brand = product.brand
      obj.category = product.root_category
      obj.sellOut = false

      // 加上库存状态
      if (onSellIds.indexOf(product.productmain_id) < 0) {
        obj.sellOut = true
        sellOutProduct.push(obj)
      } else {
        productData.push(obj)
      }
    }

    productData = productData.concat(sellOutProduct)

    if (data.display_type == 'BRAND') {
      // 按品牌分栏
      tabItem = data.brands
    } else if (data.display_type == 'CATEGORY') {
      // 按分类分栏
      tabItem = data.categories
    }

    this.data.endTime = data.end_time
    this.endTimecountDown()

    this.setData({
      productData,
      image: processImage,
      tabItem,
      displayType,
      name: data.name
    })

    this.getAllTopicData()
  },

  /**
   * 点击tab中的全部
   */
  getAllTopicData: function() {
    const productData = this.data.productData
    this.setData({
      showProductData: productData,
      tabCurrent: '全部'
    })
    this.hideDropDownList()
  },

  /**
   * 筛选的数据
   */
  getSomeTopicData: function(topicIndex) {
    let showProductData = []
    const { displayType, tabItem, productData } = this.data

    if (displayType == 'MIX') {
      // 不分栏
      showProductData = productData
    } else if (displayType == 'BRAND') {
      const topicBrand = tabItem[topicIndex]
      showProductData = productData.filter(function(product) {
        if (topicBrand == product.brand) {
          return product
        }
      })
    } else if (displayType == 'CATEGORY') {
      const topicCategory = tabItem[topicIndex]
      showProductData = productData.filter(function(product) {
        if (product.category.indexOf(topicCategory) > -1) {
          return product
        }
      })
    }

    this.setData({
      showProductData,
      tabCurrent: tabItem[topicIndex]
    })
  },

  /**
   * 点击tabItem选择展示对应主题
   */
  showTopicProduct: function(e) {
    const topicIndex = e.currentTarget.dataset.index
    this.getSomeTopicData(topicIndex)
    this.hideDropDownList()
  },

  /**
   * 显示下拉列表
   */
  showDropDownList: function() {
    this.setData({
      showDropDownList: true
    })
  },

  /**
   * 隐藏下拉列表
   */
  hideDropDownList: function() {
    this.setData({
      showDropDownList: false
    })
  },

  /**
   * 倒计时定时器
   */
  endTimecountDown: function() {
    const _this = this
    this.data.timer = setInterval(() => {
      let endTime = _this.data.endTime

      const dateResidue = _this.orderClosedTime(endTime)

      _this.setData({
        dateResidue
      })
    }, 500)
  },

  /**
   * 计算订单还有多长时间到期
   */
  orderClosedTime: function(endDate) {
    const nowTime = new Date()
    const endDate_ = new Date(endDate + 'Z') // 后台返回的时间是中国区时间,一般newDate后单位会变成中国区时间,但是如果在小程序中单位会变成格林威治时间，为了消除差异，把返回时间强制变成格林威治时间（单位改变，但是数值不变），格林威治时间比中国时间要晚8小时

    const timeDifferent = new Date().getTimezoneOffset() // 当地时间与的格林威治时间差，单位：分
    const endTime = endDate_.getTime() + timeDifferent * 60 * 1000 // 转成当地时间
    const threeDay = 3 * 24 * 60 * 60 * 1000 // 3天
    const oneDay = 1 * 24 * 60 * 60 * 1000 // 1天
    const oneHour = 60 * 60 * 1000 // 1小时

    if (endTime - nowTime.getTime() > threeDay) {
      // 大于3天不显示
      return ''
    } else if (endTime - nowTime.getTime() > oneDay) {
      // 小于3天大于1天，只显示天和小时
      const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000)
      const day = Math.floor(differenceTime / (3600 * 24))
      const hour =
        this.formatNumber(Math.floor(differenceTime / 3600)) - day * 24

      return `剩余：${day}天${hour}小时`
    } else if (endTime - nowTime.getTime() > oneHour) {
      // 小于1天大于1小时，显示小时和分
      const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000)
      const hour = Math.floor(differenceTime / 3600)
      const remainderMinute = differenceTime % 3600
      const minute = this.formatNumber(Math.floor(remainderMinute / 60))

      return `剩余：${hour}小时${minute}分钟`
    } else if (endTime - nowTime.getTime() > 0) {
      // 小于1小时显示分秒

      const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000)
      const remainderMinute = differenceTime % 3600
      const minute = Math.floor(remainderMinute / 60)
      const remainderSecond = remainderMinute % 60
      const second = this.formatNumber(remainderSecond)
      return `剩余：${minute}分钟${second}秒`
    } else {
      // clearInterval(this.data.timer);
      return `活动已结束`
    }
  },

  /**
   * 数位补全
   */
  formatNumber: function(n) {
    n = n.toString()
    if (n == 0) {
      return '00'
    } else {
      return n[1] ? n : '0' + n
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
  }
}

const assignedObject = util.assignObject(topicPage, returnTop, returnToHome)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '剁手灵感',
    enablePullDownRefresh: false
  }

  render() {
    const {
      image: image,
      dateResidue: dateResidue,
      tabCurrent: tabCurrent,
      tabItem: tabItem,
      displayType: displayType,
      showDropDownList: showDropDownList,
      name: name,
      showProductData: showProductData,
      isLoading: isLoading,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome
    } = this.state
    return (
      <View className="page" id="product-detail-top">
        <View className="topic-image">
          <Image src={image}></Image>
          {dateResidue && <Text>{dateResidue}</Text>}
        </View>
        {/*  正常效果  */}
        {(displayType != 'MIX') & !showDropDownList && (
          <View className="flashsale-nav">
            <View
              className={
                'nav-option ' + (tabCurrent == '全部' ? 'nav-selected' : '')
              }
              onClick={this.getAllTopicData}
            >
              <View className="nav-option-in">全部</View>
            </View>
            <View className="border-right-grey"></View>
            <View className="nav-options">
              <ScrollView className="nav-options-box" scrollX="true">
                {item != '全部' && (
                  <Block>
                    {tabItem.map((item, index) => {
                      return (
                        <View
                          onClick={this.showTopicProduct}
                          key={'flashsale-topix-first-' + index}
                          className={
                            'nav-option ' +
                            (item == tabCurrent ? 'nav-selected' : '')
                          }
                          data-index={index}
                        >
                          <View className="nav-option-in" data-index={index}>
                            {item}
                          </View>
                        </View>
                      )
                    })}
                  </Block>
                )}
              </ScrollView>
            </View>
            <View className="nav-show" onClick={this.showDropDownList}>
              <I className="sparrow-icon icon-unfold"></I>
            </View>
          </View>
        )}
        {/*  弹出效果  */}
        {showDropDownList && (
          <View className="nav-select-dialog">
            <View className="dialog-nav">
              <View className="nav-select">请选择</View>
              <View className="nav-show" onClick={this.hideDropDownList}>
                <I className="sparrow-icon icon-arrows-top"></I>
              </View>
            </View>
            <View
              className="dialog-mask-layer"
              onClick={this.hideDropDownList}
            ></View>
            <View className="nav-dialog clearfix">
              <Text
                onClick={this.getAllTopicData}
                className={tabCurrent == '全部' ? 'current' : ''}
              >
                全部
              </Text>
              {tabItem.map((item, index) => {
                return (
                  <Text
                    onClick={this.showTopicProduct}
                    key={'flashsale-categories-second-' + index}
                    className={item == tabCurrent ? 'current' : ''}
                    data-index={index}
                  >
                    {item}
                  </Text>
                )
              })}
            </View>
          </View>
        )}
        <View className="sub-title">
          <Span className="sub-title-text">{name}</Span>
        </View>
        <View className="clearfix">
          {showProductData.map((item, idx) => {
            return (
              <Block key={'show-product-data-' + index}>
                {idx % 2 == 0 ? (
                  <Block>
                    <ShopItembTmpl
                      data={{
                        '...item,isOddShop': 'isOddShop'
                      }}
                    ></ShopItembTmpl>
                  </Block>
                ) : (
                  <Block>
                    <ShopItembTmpl
                      data={{
                        '...item,isOddShop': ''
                      }}
                    ></ShopItembTmpl>
                  </Block>
                )}
              </Block>
            )
          })}
        </View>
        {!isLoading && showProductData.length > 0 && (
          <View className="weui-loadmore">
            <View className="weui-loadmore__tips weui-loadmore__tips_in-line">
              没有更多啦
            </View>
          </View>
        )}
        <ReturnTopTmpl data={showReturnTop}></ReturnTopTmpl>
        <ReturnToHomeTmpl
          data={{
            showReturnToHome: showReturnToHome
          }}
        ></ReturnToHomeTmpl>
      </View>
    )
  }
}

export default _C
