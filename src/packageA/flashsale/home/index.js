import {
  Block,
  View,
  Image,
  Text,
  ScrollView,
  Button
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import returnTop from '../../../component/returnTop/returnTop.js'
import returnToHome from '../../../component/returnToHome/returnToHome.js'
import GIO_utils from '../../../utils/GIO_utils.js'

import ReturnToHomeTmpl from '../../../imports/ReturnToHomeTmpl.js'
import ReturnTopTmpl from '../../../imports/ReturnTopTmpl.js'
import './index.scss'
const flashsalePage = {
  /**
   * 页面的初始数据
   */
  data: {
    flashSaleInfo: null,
    flashSaleList: null,
    showClassify: false,
    dateResidue: '',
    categories: [], // 分类
    categorieCurrent: '全部',
    products: {}, // 商品
    isLoading: true
  },

  /**
   * 获取当期闪购信息
   */
  getFlashSaleInfo: function(parameter) {
    console.log(constant.flashSalePromotions + parameter)
    let that = this
    util.request({
      url: constant.flashSalePromotions + parameter,
      hasToken: false,
      success: function(data) {
        data.end_time = data.end_time

        if (util.needPrecssImage(data.image)) {
          data.image = data.image + constant.imageSuffix.focus
        }
        that.setData({
          flashSaleInfo: data
        })

        that.endTimecountDown()
        that.getFlashSaleProducts(parameter)
      }
    })
  },

  /**
   * 倒计时定时器
   */
  endTimecountDown: function() {
    const _this = this
    this.data.timer = setInterval(() => {
      let endTime = _this.data.flashSaleInfo.end_time

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
   * 计算订单还有多长时间到期
   */
  // orderClosedTime: function (endDate) {

  //   const nowTime = new Date();
  //   const endDate_ = new Date(endDate + 'Z'); // 后台返回的时间是中国区时间,一般newDate后单位会变成中国区时间,但是如果在小程序中单位会变成格林威治时间，为了消除差异，把返回时间强制变成格林威治时间（单位改变，但是数值不变），格林威治时间比中国时间要晚8小时

  //   const timeDifferent = (new Date()).getTimezoneOffset(); // 当地时间与的格林威治时间差，单位：分

  //   const endTime = endDate_.getTime() + timeDifferent * 60 * 1000; // 转成当地时间

  //   const twoDay = 2 * 24 * 60 * 60 * 1000; // 2天

  //   if (endTime - nowTime.getTime() > twoDay) {
  //     // 大于2天不显示
  //     const remainDay = Math.floor((endTime - nowTime.getTime()) / (24 * 60 * 60 * 1000));
  //     return '剩余' + remainDay + '天';
  //   } else if (endTime - nowTime.getTime() < 0) {

  //     clearInterval(this.data.timer);
  //     return `活动已结束`;
  //   } else {

  //     const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000);
  //     const hour = this.formatNumber(Math.floor(differenceTime / 3600));
  //     const remainderMinute = differenceTime % 3600;
  //     const minute = this.formatNumber(Math.floor(remainderMinute / 60));
  //     const remainderSecond = remainderMinute % 60;
  //     const second = this.formatNumber(remainderSecond);

  //     return `剩余：${hour}小时${minute}分钟${second}秒`;
  //   }
  // },

  /**
   * 数位补全
   */
  formatNumber: function(n) {
    n = n.toString()
    if (n == 0) {
      return 0
    } else {
      return n[1] ? n : '0' + n
    }
  },

  /**
   * 获取闪购商品列表
   */
  getFlashSaleProducts: function(parameter) {
    let that = this

    util.request({
      url: constant.flashSaleList + parameter,
      hasToken: false,
      success: data => {
        that.data.count = data.count
        // that.processProductsData(data.results);

        that.getProductsSellStatus(that.data.flashSaleInfo.id, data.results)
      }
    })
  },

  /**
   * 给数据加上库存状态
   */
  getProductsSellStatus: function(id, data) {
    const allIds = this.getProductMainIds(data.products)
    const _this = this

    util.request({
      url: constant.getFlashsaleSellStatus,
      hasToken: false,
      method: 'POST',
      data: {
        flashsale_id: id,
        productmain_ids: allIds
      },
      success: function(res) {
        const getOnSellProductsObj = _this.getOnSellProductsObj(res.results)
        _this.processProductsData(data, getOnSellProductsObj)
      }
    })
  },

  /**
   * 获得在售闪购商品信息
   */
  getOnSellProductsObj: function(data) {
    let onSellProductsObj = {}

    data.forEach(function(product) {
      if (product.remains > 0) {
        onSellProductsObj[product.productmain_id] = product
      }
    })

    return onSellProductsObj
  },

  /**
   * 获取所有产品的所有id
   */
  getProductMainIds: function(data) {
    let allIds = []

    allIds = data.map(function(product) {
      return product.productmain_id
    })

    return allIds
  },

  /**
   * 处理商品数据
   */
  processProductsData: function(data, onSellObj) {
    // 分类
    const all = '全部'
    let categories = data.filters.categories
    categories.unshift(all)

    // 商品
    let productsArr = []
    let productsArrOnSell = []
    let productsArrSoldOut = []
    let productsObj = Object.create(null)
    let productTemp
    data.products.map(product => {
      let processImage = product.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }

      productTemp = {
        id: product.id,
        productmainId: product.productmain_id,
        name: product.name,
        image: processImage,
        original_price: product.original_price,
        retail_price: product.retail_price,
        root_category: product.root_category,
        description: product.flashsale.description,
        brand: product.brand,
        flashsale_id: product.flashsale.flashsale_id,
        price: product.flashsale.price
      }

      // 加上库存状态
      if (onSellObj[product.productmain_id]) {
        // 未售罄
        productTemp.sellOut = false
        productTemp.percent = this.getSaleProductPercent(
          onSellObj[product.productmain_id].remains,
          onSellObj[product.productmain_id].stock
        )
        productTemp.remainPercent = this.getSaleProductRemainPercent(
          onSellObj[product.productmain_id].remains,
          onSellObj[product.productmain_id].stock
        )
        productsArrOnSell.push(productTemp)
      } else {
        // 已售罄
        productTemp.sellOut = true
        productTemp.percent = '100%'
        productTemp.remainPercent = '0%'
        productsArrSoldOut.push(productTemp)
      }
    })

    productsArr = productsArrOnSell.concat(productsArrSoldOut)

    for (let i = 0; i < productsArr.length; i++) {
      productsArr[i].root_category.forEach(category => {
        if (!productsObj[category]) {
          productsObj[category] = [productsArr[i]]
        } else {
          productsObj[category].push(productsArr[i])
        }
      })
    }

    productsObj[all] = productsArr

    this.setData({
      categories: categories,
      products: productsObj,
      isLoading: false
    })
  },

  /**
   * 已卖出的商品百分比
   */
  getSaleProductPercent: function(remains, stock) {
    if (stock == 0) {
      return '100%'
    } else if (remains - stock > 0) {
      return '0%'
    } else {
      return `${Math.floor((1 - remains / stock) * 100)}%`
      // return `${ 100 - Math.floor(stock * 100 / (sales + stock))}%`;
    }
  },

  /**
   * 剩余商品百分比
   */
  getSaleProductRemainPercent: function(remains, stock) {
    if (stock == 0) {
      return '0%'
    } else if (remains - stock > 0) {
      return '100%'
    } else {
      return `${Math.floor((remains * 100) / stock)}%`
      // return `${Math.floor(stock * 100 / (sales + stock))}%`;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    if (options.share_param) {
      wx.globalData.userSimpleInfo.share_param = options.share_param
    }

    this.judgeAndShowReturnToHome(options)
    // from_share是判断是不是从别人的分享打开的小程序
    if (options.from_share == 1) {
      delete options.from_share
    }

    let str = ''
    for (let i in options) {
      str += i + '=' + options[i] + '&'
    }
    str = str.slice(0, str.length - 1)

    if (str) {
      // 有参数，参数组合后传给后台
      str = '?' + str
    }

    this.getFlashSaleInfo(str)
    this.getScreenHeight()
  },

  /**
   * 监听页面滚动
   */
  onPageScroll: function(e) {
    this.judgeAndShowReturnTop(e)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    util.printLog('wechat_app', 'go_to_flashsale', '')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.timer)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const obj_GIO = {
      sharePage_var: '闪购列表'
    }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    let url_options = {
      channel: '小程序分享',
      pageName: '闪购列表'
    }
    url_options = this.getCurrentPageParameterToShare(url_options)

    let new_url = util.return_current_url_with_options(url_options)

    return {
      path: new_url
    }
  },

  /**
   * 显示隐藏分类弹框
   */
  handleToggleClassify: function() {
    this.setData({
      showClassify: !this.data.showClassify
    })
  },

  /**
   * 马上抢
   */
  handleBuy: function(e) {
    let id = e.target.dataset.id
    let flashsaleId = e.target.dataset.flashsaleId
    Taro.navigateTo({
      url:
        '/packageA/product/detail/detail?flashsale_id=' +
        flashsaleId +
        '&id=' +
        id
    })
  },

  /**
   * 选择分类
   */
  handleSelectedClassify: function(e) {
    let value = e.target.dataset.value
    console.log(e)

    this.setData({
      categorieCurrent: value,
      showClassify: false
    })
  },

  /**
   * 点击闪购item进入闪购商品详情页
   */
  clickFlashsaleToDetail: function(e) {
    let id = e.target.dataset.id
    let flashsaleId = e.target.dataset.flashsaleId
    Taro.navigateTo({
      url:
        '/packageA/product/detail/detail?flashsale_id=' +
        flashsaleId +
        '&id=' +
        id
    })
  }
}

const assignedObject = util.assignObject(flashsalePage, returnTop, returnToHome)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '闪购囤货',
    enablePullDownRefresh: false
  }

  render() {
    const {
      flashSaleInfo: flashSaleInfo,
      dateResidue: dateResidue,
      categorieCurrent: categorieCurrent,
      categories: categories,
      showClassify: showClassify,
      products: products,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome,
      isLoading: isLoading
    } = this.state
    return (
      <Block>
        {/*  头图  */}
        <View className="flashsale-image">
          <Image src={flashSaleInfo.image}></Image>
          {dateResidue && <Text>{dateResidue}</Text>}
        </View>
        {/*  正常效果  */}
        {dateResidue == '活动已结束' ? (
          <Block>
            <View className="weui-loadmore weui-loadmore_line">
              <View className="weui-loadmore__tips weui-loadmore__tips_in-line">
                活动已结束
              </View>
            </View>
          </Block>
        ) : (
          <Block>
            {!showClassify ? (
              <View className="flashsale-nav">
                <View
                  className={
                    'nav-option ' +
                    (categorieCurrent == '全部' ? 'nav-selected' : '')
                  }
                  onClick={this.handleSelectedClassify}
                  data-value="全部"
                >
                  <View data-value="全部" className="nav-option-in">
                    全部
                  </View>
                </View>
                <View className="border-right-grey"></View>
                <View className="nav-options">
                  <ScrollView className="nav-options-box" scrollX="true">
                    {item != '全部' && (
                      <Block>
                        {categories.map((item, index) => {
                          return (
                            <View
                              onClick={this.handleSelectedClassify}
                              key={'flashsale-categories-first-' + index}
                              className={
                                'nav-option ' +
                                (item == categorieCurrent ? 'nav-selected' : '')
                              }
                              data-value={item}
                            >
                              <View className="nav-option-in" data-value={item}>
                                {item}
                              </View>
                            </View>
                          )
                        })}
                      </Block>
                    )}
                  </ScrollView>
                </View>
                <View className="nav-show" onClick={this.handleToggleClassify}>
                  <I className="sparrow-icon icon-unfold"></I>
                </View>
              </View>
            ) : (
              <View className="nav-select-dialog">
                <View className="dialog-nav">
                  <View className="nav-select">请选择</View>
                  <View
                    className="nav-show"
                    onClick={this.handleToggleClassify}
                  >
                    <I className="sparrow-icon icon-arrows-top"></I>
                  </View>
                </View>
                <View
                  className="dialog-mask-layer"
                  onClick={this.handleToggleClassify}
                ></View>
                <View className="nav-dialog clearfix">
                  {categories.map((item, index) => {
                    return (
                      <Text
                        onClick={this.handleSelectedClassify}
                        key={'flashsale-categories-second-' + index}
                        className={categorieCurrent === item ? 'current' : ''}
                        data-value={item}
                      >
                        {item}
                      </Text>
                    )
                  })}
                </View>
              </View>
            )}
            {/*  弹出效果  */}
            {/*  商品列表  */}
            <View className="flashsale-list" id="product-detail-top">
              {products[categorieCurrent].map((item, index) => {
                return (
                  <View
                    key={'flashsale-product-' + index}
                    className="flashsale-item"
                  >
                    <View className="flashsale-item-image">
                      <Image
                        src={item.image}
                        lazyLoad="true"
                        data-flashsale-id={item.flashsale_id}
                        data-id={item.id}
                        onClick={this.clickFlashsaleToDetail}
                      ></Image>
                      {item.sellOut && (
                        <Image
                          src
                          className="sparrow-icon icon-sell-out"
                        ></Image>
                      )}
                    </View>
                    <View className="flashsale-item-content">
                      <View
                        className="flashsale-item-title"
                        data-flashsale-id={item.flashsale_id}
                        data-id={item.id}
                        onClick={this.clickFlashsaleToDetail}
                      >
                        {item.brand + ' ' + item.name}
                      </View>
                      <View
                        className="flashsale-item-desc"
                        data-flashsale-id={item.flashsale_id}
                        data-id={item.id}
                        onClick={this.clickFlashsaleToDetail}
                      >
                        {item.description ? item.description : ''}
                      </View>
                      <View className="flashsale-item-price">
                        <View className="flashsale-item-flashprice">
                          ￥<Text>{item.price}</Text>
                        </View>
                        {item.original_price - item.price > 0 && (
                          <View className="flashsale-item-originalprice">
                            ￥<Text>{item.original_price}</Text>
                          </View>
                        )}
                      </View>
                      <View className="flashsale-item-bottom">
                        <View className="flashsale-item-progiress">
                          <View style={'width: ' + item.percent + ';'}></View>
                          <Text>{'剩余' + item.remainPercent}</Text>
                        </View>
                        {item.sellOut ? (
                          <Button className="flashsale-item-button flashsale-item-button-noable">
                            抢完了
                          </Button>
                        ) : (
                          <Button
                            onClick={this.handleBuy}
                            data-flashsale-id={item.flashsale_id}
                            data-id={item.id}
                            className="flashsale-item-button"
                          >
                            马上抢
                          </Button>
                        )}
                      </View>
                    </View>
                  </View>
                )
              })}
              <ReturnTopTmpl data={showReturnTop}></ReturnTopTmpl>
              <ReturnToHomeTmpl
                data={{
                  showReturnToHome: showReturnToHome
                }}
              ></ReturnToHomeTmpl>
            </View>
            {/*  加载效果  */}
            {isLoading ? (
              <View className="weui-loadmore">
                <View className="weui-loading"></View>
                <View className="weui-loadmore__tips">正在加载</View>
              </View>
            ) : (
              <View className="weui-loadmore weui-loadmore_line">
                <View className="weui-loadmore__tips weui-loadmore__tips_in-line">
                  没有更多啦
                </View>
              </View>
            )}
          </Block>
        )}
      </Block>
    )
  }
}

export default _C
