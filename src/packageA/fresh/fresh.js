import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import returnTop from '../../component/returnTop/returnTop.js'
import returnToHome from '../../component/returnToHome/returnToHome.js'

import ReturnToHomeTmpl from '../../imports/ReturnToHomeTmpl.js'
import ReturnTopTmpl from '../../imports/ReturnTopTmpl.js'
import RedSmallSpanTmpl from '../../imports/RedSmallSpanTmpl.js'
import ProductTitleTmpl from '../../imports/ProductTitleTmpl.js'
import './fresh.scss'
const freshPage = {
  /**
   * 页面的初始数据
   */
  data: {
    image: '', // 主图地址
    showProductData: [], //当前展示的所有商品数据
    next: constant.getFreshProductData + '?page=1&page_size=10',
    isLoading: 'loading'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    this.judgeAndShowReturnToHome(options)
    this.getFlashTopicImage()
    this.getFreshProductData()
    this.getScreenHeight()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

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
    util.printLog('wechat_app', 'go_to_newproduct', '')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getFreshProductData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const options = this.return_current_page_options()
    const new_options = this.getCurrentPageParameterToShare(options)
    const path = util.return_current_url_with_options(new_options)

    return {
      path
    }
  },

  /**
   * 获得新草必拔头图
   */
  getFlashTopicImage: function() {
    let image = ''
    const _this = this

    util.request({
      url: constant.getFlashTopicImage,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        image = res.image
        if (util.needPrecssImage(image)) {
          image = image + constant.imageSuffix.focus
        }

        _this.setData({
          image
        })
      }
    })
  },

  /**
   * 获得专题页面数据
   */
  getFreshProductData: function() {
    const _this = this

    if (this.data.next) {
      util.request({
        url: this.data.next,
        method: 'GET',
        hasToken: false,
        success: function(res) {
          if (res.next) {
            _this.setData({
              next: res.next
            })
          } else {
            setTimeout(function() {
              _this.setData({
                isLoading: 'nomore',
                next: res.next
              })
            }, 500)
          }
          _this.handleData(res.results)
        }
      })
    }
  },

  /**
   * 处理活动数据API返回的数据
   */
  handleData: function(data) {
    let showProductData = this.data.showProductData // 存的是整理过的product完整数据
    let newShowProductData = []

    newShowProductData = data.map(function(product) {
      let processImage = product.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }

      let obj = {}
      obj.img = processImage
      obj.retailPrice = product.display_price
      obj.title = product.brand + ' ' + product.name
      obj.id = product.id
      obj.activeArr = product.promotion_names
      obj.subTitle = product.sub_title
      obj.brand = product.brand
      return obj
    })
    // console.log(showProductData);
    const arr = showProductData.concat(newShowProductData)

    this.setData({
      showProductData: arr
    })

    // this.getTopicData(0);
  },

  /**
   * 筛选的数据
   */
  getTopicData: function(topicIndex) {
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
      showProductData
    })
  },

  /**
   * 点击tabItem选择展示对应主题
   */
  showTopicProduct: function(e) {
    const topicIndex = e.currentTarget.dataset.index
    this.getTopicData(topicIndex)
  },

  /**
   * 获得timeStr
   */
  getTimeStr: function(time) {
    let endDate = new Date(time)
    endDate.setDate(endDate.getDate() + 1)
    const endTime = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    )
    this.countDown(endTime)
  },

  /**
   * 活动剩余时间 - 倒计时
   */
  countDown: function(end) {
    let that = this
    const dateNow = new Date()
    // dateNow.setDate(dateNow.getDate() + 47);
    let dateRefference = this.getDateRefference(dateNow, end)
    if (dateRefference.day > 0) {
      this.setData({
        dateResidue: `剩余${dateRefference.day}天`
      })
    } else if (dateRefference.second > 0) {
      let dateResidue = that.formatDate(dateRefference.second)
      setInterval(() => {
        dateResidue = that.formatDate(dateResidue.second - 1)
        this.setData({
          dateResidue: `剩余${dateResidue.text}`
        })
      }, 1000)
    } else {
      this.setData({
        dateResidue: '活动已结束'
      })
    }
  },

  /**
   * 获取时间差
   */
  getDateRefference: function(start, end) {
    let millisecondStart = new Date(start)
    let millisecondEnd = new Date(end)
    let secondDifference = Math.floor(
      (millisecondEnd - millisecondStart) / 1000
    )

    return this.formatDate(secondDifference)
  },

  /**
   * 格式化倒计时日期
   */
  formatDate: function(secondDifference) {
    let dayDifference = Math.floor(secondDifference / 86400)
    if (dayDifference > 0) {
      return {
        second: secondDifference,
        day: dayDifference,
        text: dayDifference
      }
    } else {
      let dayRemainder = secondDifference % 86400
      let hourDifference = Math.floor(dayRemainder / 3600)
      let hourRemainder = dayRemainder % 3600
      let minuteDifference = Math.floor(hourRemainder / 60)
      let minuteRemainder = hourRemainder % 60

      return {
        second: dayRemainder,
        day: 0,
        text: `${util.formatNumber(hourDifference)}:${util.formatNumber(
          minuteDifference
        )}:${util.formatNumber(minuteRemainder)}`
      }
    }
    return {
      second: 0,
      day: 0,
      text: `活动已结束`
    }
  },

  /**
   * 点击专题页头图进入对应单品
   */
  productDestination: function() {
    const id = this.data.imageProductId
    Taro.navigateTo({
      url: '/packageA/product/detail/detail?id=' + id
    })
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

const assignedObject = util.assignObject(freshPage, returnTop, returnToHome)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '新草必拔',
    enablePullDownRefresh: false
  }

  render() {
    const {
      image: image,
      index: index,
      showProductData: showProductData,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome,
      isLoading: isLoading
    } = this.state
    return (
      <View className="page" id="product-detail-top">
        <View className="fresh-image">
          <Image src={image}></Image>
        </View>
        <View className="sub-title">
          <Span className="sub-title-text">新品到店，每周更新</Span>
        </View>
        <View>
          {showProductData.map((item, idx) => {
            return (
              <Block key={'show-product-data-' + index}>
                {idx % 2 == 0 ? (
                  <Block>
                    <View
                      className="shop-row isOddShop"
                      data-id={item.id}
                      onClick={this.linkToProductInfo}
                    >
                      <View className="shop-left fresh">
                        <View className="img-out">
                          <Image
                            className="shop-img"
                            alt="商品图"
                            mode="aspectFit"
                            src={item.img}
                          ></Image>
                          {item.sellOut && (
                            <Image
                              src
                              className="sparrow-icon icon-sell-out"
                            ></Image>
                          )}
                          <View className="fresh-brand-view">
                            <Text className="fresh-brand-text">
                              {item.brand}
                            </Text>
                          </View>
                        </View>
                        <View className="shop-list2-body fresh">
                          <ProductTitleTmpl
                            data={{
                              mainTitle: item.title
                            }}
                          ></ProductTitleTmpl>
                          <View className="fresh-sub-title">
                            {item.subTitle}
                          </View>
                          <View className="fresh-price-pro">
                            <View className="price-selling">
                              <Text className="i">￥</Text>
                              {item.retailPrice}
                            </View>
                            {item.activeArr.length > 0 && (
                              <View className="fresh-red-small">
                                <RedSmallSpanTmpl
                                  data={{
                                    content: item.activeArr[0]
                                  }}
                                ></RedSmallSpanTmpl>
                              </View>
                            )}
                            {/*  <view wx:if="{{ item.activeArr.length > 0 }}"> 
                                                                         <template  is="redSmallSpan" data="{{content: '加价购'}}"/>
                                                                       </view>                 */}
                          </View>
                        </View>
                      </View>
                    </View>
                  </Block>
                ) : (
                  <Block>
                    <View
                      className="shop-row"
                      data-id={item.id}
                      onClick={this.linkToProductInfo}
                    >
                      <View className="shop-left fresh">
                        <View className="img-out">
                          <Image
                            className="shop-img"
                            alt="商品图"
                            mode="aspectFit"
                            src={item.img}
                          ></Image>
                          {item.sellOut && (
                            <Image
                              src
                              className="sparrow-icon icon-sell-out"
                            ></Image>
                          )}
                          <View className="fresh-brand-view">
                            <Text className="fresh-brand-text">
                              {item.brand}
                            </Text>
                          </View>
                        </View>
                        <View className="shop-list2-body fresh">
                          <ProductTitleTmpl
                            data={{
                              mainTitle: item.title
                            }}
                          ></ProductTitleTmpl>
                          <View className="fresh-sub-title">
                            {item.subTitle}
                          </View>
                          <View className="fresh-price-pro">
                            <View className="price-selling">
                              <Text className="i">￥</Text>
                              {item.retailPrice}
                            </View>
                            {item.activeArr.length > 0 && (
                              <View className="fresh-red-small">
                                <RedSmallSpanTmpl
                                  data={{
                                    content: item.activeArr[0]
                                  }}
                                ></RedSmallSpanTmpl>
                              </View>
                            )}
                            {/*  <view wx:if="{{ item.activeArr.length > 0 }}"> 
                                                                         <template  is="redSmallSpan" data="{{content: '加价购'}}"/>
                                                                       </view>                 */}
                          </View>
                        </View>
                      </View>
                    </View>
                  </Block>
                )}
              </Block>
            )
          })}
        </View>
        <ReturnTopTmpl data={showReturnTop}></ReturnTopTmpl>
        <ReturnToHomeTmpl
          data={{
            showReturnToHome: showReturnToHome
          }}
        ></ReturnToHomeTmpl>
        <View className="list-foot">
          {isLoading == 'nomore' ? (
            <Block>没有更多了</Block>
          ) : (
            <Block>加载中...</Block>
          )}
        </View>
      </View>
    )
  }
}

export default _C
