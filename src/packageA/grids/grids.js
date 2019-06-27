import { Block, ScrollView, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// packageA/grids/grids.js
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import returnToHome from '../../component/returnToHome/returnToHome.js'
import getCouponModel from '../../component/getCoupon/index.js'
import GIO_utils from '../../utils/GIO_utils.js'

import ReturnToHomeTmpl from '../../imports/ReturnToHomeTmpl.js'
import DisplayProductSwiperTmpl from '../../imports/DisplayProductSwiperTmpl.js'
import DisplayProductDefaultTmpl from '../../imports/DisplayProductDefaultTmpl.js'
import DisplayImageTmpl from '../../imports/DisplayImageTmpl.js'
import './grids.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    gridsData: [], // 每个网格对象的详细内容存放的地方
    gridsRows: [], // 网格整体架构，按每行划分（能左右滑动的单品罗列按块划分）
    pageSize: 10000, // 一次获取的网格行数(无限大，一次取完所有数目)
    // pageIndex: 1, // 当前获得数据页数
    // nexGridsDataUrl: '',
    gridsPageId: 0, // 田字格Id
    gridsDataIndex: {}, // 由productId拿到对应的gridsData，为了方便找到对应的商品是闪购还是正常商品
    isLoading: 'loading',
    anchorText: '', // 锚点
    showReturnTop: false, // 控制是否显示回到顶部
    screenHeight: 900, // 超过这个高度就显示回到顶部
    scrollTop: 0 // 滚动到指定位置
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

    const gridsPageId = options.id
    // const pageSize = this.data.pageSize;
    this.data.gridsPageId = gridsPageId
    this.setData({
      gridsPageId: gridsPageId
    })
    util.printLog('wechat_app', 'go_to_grids', gridsPageId)
    // this.data.nexGridsDataUrl = constant.getGridsData + gridsPageId + '/rows/?page_size=' + pageSize;
    this.getGridsData()

    // this.getScreenHeight();
    options.from_share = true
    this.judgeAndShowReturnToHome(options)

    // 只有 sk2 参加领券活动，老田字格ID 33 SKII5月
    // if (options.id == 33) {
    // 获取领券活动信息
    //   this.initGetCoupon();
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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
    // this.getGridsData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const obj_GIO = { sharePage_var: 'old_grids' }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    let url_options = {
      channel: '小程序分享',
      pageName: 'old_grids'
    }

    url_options = this.getCurrentPageParameterToShare(url_options)
    let new_url = util.return_current_url_with_options(url_options)

    return {
      path: new_url
    }
  },

  /**
   * 获得网格数据
   */
  getGridsData: function() {
    // const url = this.data.nexGridsDataUrl;
    const gridsPageId = this.data.gridsPageId
    const pageSize = this.data.pageSize
    const url =
      constant.getGridsData + gridsPageId + '/rows/?page_size=' + pageSize

    if (url) {
      const _this = this
      // const id = this.data.gridsPageId;
      util.request({
        url: url,
        method: 'GET',
        hasToken: false,
        success: function(res) {
          // _this.data.nexGridsDataUrl = res.next;
          _this.handleGridsData(res.results)

          if (res.next == null) {
            _this.setData({
              isLoading: 'nomore'
            })
          }
        }
      })
    }
  },

  /**
   * 分类处理网格信息数据
   */
  handleGridsData: function(data) {
    const _this = this

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      let displayType = ''
      let rowIndex = 0

      switch (row.node_type) {
        case 'image':
          //  图片罗列
          displayType = row.display_type
          rowIndex = _this.initRow('image', displayType)
          _this.data.gridsRows[rowIndex].point_name = row.point_name
          _this.handleImageTypeData(row, rowIndex)
          break

        case 'brand':
          // 品牌的所有单品
          displayType = row.display_type
          rowIndex = _this.initRow('brand', displayType)
          _this.data.gridsRows[rowIndex].point_name = row.point_name
          _this.handleBrandTypeData(row, rowIndex)
          break

        case 'category':
          // 分类的所有单品
          displayType = row.display_type
          rowIndex = _this.initRow('category', displayType)
          _this.data.gridsRows[rowIndex].point_name = row.point_name
          _this.handleCategoryTypeData(row, rowIndex)
          break

        case 'flash_sale':
          // 闪购的所有单品
          displayType = row.display_type
          rowIndex = _this.initRow('flash_sale', displayType)
          _this.data.gridsRows[rowIndex].point_name = row.point_name
          _this.handleFlashSaleTypeData(row, rowIndex)
          break

        case 'home_topic':
          // 剁手灵感
          displayType = row.display_type
          rowIndex = _this.initRow('home_topic', displayType)
          _this.handleHomeTopicTypeData(row, rowIndex)
          break
      }
    }
  },

  /**
   * 初始化一行（如果是单品罗列，那么是一块，自动分行，不止一行）
   *  为了保证行不乱，得按顺序占位，占位后再掉后台API拿单品数据
   */
  initRow: function(nodeType, displayType) {
    let rowObj = {}
    rowObj.nodeType = nodeType
    rowObj.displayType = displayType
    rowObj.item = []

    this.data.gridsRows.push(rowObj)
    const rowIndex = this.data.gridsRows.length - 1
    // 返回初始化的行index
    return rowIndex
  },

  /**
   * obj是该格子的信息对象，rowIndex是行数，由gridsRows[rowIndex]确定页面中唯一“行”（当这“行”为单品自由罗列时，“行”在页面中体现为“块”）
   *
   * 把田字格每一项详细信息放到gridsData数组，并且把对应的index记录下来放到gridsRows[rowIndex].item里
   * 其实gridsRows和gridsData是可以合并的，但是为了让页面数据不要嵌套太深，影响页面性能，所以把他们拆开
   */
  saveItemData: function(obj, rowIndex, productType) {
    let gridsData = this.data.gridsData
    let gridsRows = this.data.gridsRows
    const id = obj.id

    gridsData.push(obj)
    const gridsDataindex = gridsData.length - 1
    gridsRows[rowIndex].item.push(gridsDataindex)

    if (productType == 'product') {
      // 这里有个坑，如果同一页面同一个商品，在一个地方是闪购商品，而在另一个地方是正常商品，那么有效值只有一个，就是最后被更改的那次
      this.data.gridsDataIndex[id] = gridsDataindex
    }
  },

  /**
   * 处理一行图片罗列类型数据
   */
  handleImageTypeData: function(row, rowIndex) {
    let widthSum = 0
    let windowWidth = 0
    let imageMaxHeight = 0

    Taro.getSystemInfo({
      success: function(res) {
        windowWidth = res.windowWidth
      }
    })

    for (let i = 0; i < row.children.length; i++) {
      widthSum += row.children[i].image_width
    }

    for (let i = 0; i < row.children.length; i++) {
      const item = row.children[i]
      let obj = {}
      obj.image = item.image
      obj.url = ''
      // obj.target_point = item.target_point;

      const width = Math.floor((item.image_width / widthSum) * 10000) / 100
      obj.width = width + '%'

      // 这个是个公式：算出当比例不变的情况下，当前赋予的宽度（px）对应的高度（px）
      obj.height =
        Math.floor(
          ((((windowWidth * width) / 100) * item.image_height) /
            item.image_width) *
            100
        ) / 100
      // 并且取出一个当行最高高度
      imageMaxHeight = obj.height > imageMaxHeight ? obj.height : imageMaxHeight

      if (item.destination_url) {
        obj.url = item.destination_url.url
      }

      this.saveItemData(obj, rowIndex)
    }

    // 为这行的每一个图片高度都赋予最高的高度，每个图片的高度可能会有细微不一样，因为宽不是精准百分比，所以高度也不精准统一
    for (let i = 0; i < this.data.gridsRows[rowIndex].item.length; i++) {
      const gridsDataIndex = this.data.gridsRows[rowIndex].item[i]
      this.data.gridsData[gridsDataIndex].height = imageMaxHeight
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理品牌单品类型数据
   */
  handleBrandTypeData: function(row, rowIndex) {
    const _this = this
    const brandId = row.brand_id

    if ((brandId || brandId == 0) && row.quantity > 0) {
      const pageNum = row.quantity

      util.request({
        url:
          constant.getBrandProductsList2 +
          '?brand_id=' +
          brandId +
          '&page_size=' +
          pageNum,
        method: 'GET',
        hasToken: false,
        success: function(res) {
          _this.getProductsSellStatus(res.results.products, rowIndex)
        }
      })
    }
  },

  /**
   * 处理分类单品类型数据
   */
  handleCategoryTypeData: function(row, rowIndex) {
    const _this = this
    const pageNum = row.quantity

    let postObj = {
      keyword: '', // 初始的搜索字
      filters: {},
      page: 0,
      sort: {
        default: ''
      }
    }

    if (row.category && row.category.name && pageNum > 0) {
      postObj.filters.categories = [row.category.name]

      util.request({
        url: constant.getProductList + '?page_size=' + pageNum,
        method: 'POST',
        hasToken: false,
        data: postObj,
        success: function(res) {
          _this.getProductsSellStatus(res.results.products, rowIndex)
        }
      })
    }
  },

  /**
   * 处理剁手灵感单品类型数据
   */
  handleHomeTopicTypeData: function(row, rowIndex) {
    const _this = this
    const topicId = row.home_topic_id
    const pageNum = row.quantity

    if ((topicId || topicId == 0) && pageNum > 0) {
      util.request({
        url:
          constant.getHomeTopicData +
          topicId +
          '/products/?page_size=' +
          pageNum,
        method: 'GET',
        hasToken: false,
        success: function(res) {
          _this.getProductsSellStatus(res.results, rowIndex)
        }
      })
    }
  },

  /**
   * 处理闪购单品类型数据
   */
  handleFlashSaleTypeData: function(row, rowIndex) {
    const _this = this
    const flashSaleId = row.flash_sale_id
    // const flashSaleId = 15;
    const pageNum = row.quantity
    console.log(flashSaleId, pageNum)

    if ((flashSaleId || flashSaleId == 0) && pageNum > 0) {
      util.request({
        url:
          constant.flashSaleList +
          '?id=' +
          flashSaleId +
          '&page_size=' +
          pageNum,
        hasToken: false,
        success: res => {
          _this.getFlashSaleProductsSellStatus(
            res.results.products,
            rowIndex,
            flashSaleId
          )
        }
      })
    }
  },

  /**
   * 给数据加上库存状态
   */
  getProductsSellStatus: function(data, rowIndex) {
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
        _this.handleProductsListData(
          data,
          onSellProductsIds,
          rowIndex,
          'default'
        )
      }
    })
  },

  /**
   * 给闪购数据加上库存状态
   */
  getFlashSaleProductsSellStatus: function(data, rowIndex, flashSaleId) {
    // 得到所有商品id数组（用来查询库存）
    const allIds = this.getProductIds(data)
    const _this = this

    util.request({
      url: constant.getFlashsaleSellStatus,
      method: 'POST',
      hasToken: false,
      data: {
        flashsale_id: flashSaleId,
        productmain_ids: allIds
      },
      success: function(res) {
        const onSellProductsIds = _this.getOnSellFalshSaleProductsIds(
          res.results
        )
        console.log('onSellProductsIds=', onSellProductsIds)
        _this.handleProductsListData(
          data,
          onSellProductsIds,
          rowIndex,
          'flashSale',
          flashSaleId
        )
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
   * 获得闪购在售商品id合集
   */
  getOnSellFalshSaleProductsIds: function(data) {
    let onSellProductsIds = []

    data.forEach(function(product) {
      if (product.remains > 0) {
        onSellProductsIds.push(product.productmain_id)
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
   * 处理产品列表数据
   */
  handleProductsListData: function(
    products,
    onSellIds,
    rowIndex,
    productType,
    flashSaleId
  ) {
    for (let i = 0; i < products.length; i++) {
      let obj = {}
      const val = products[i]
      obj.originalPrice = val.original_price
      obj.retailPrice = val.display_price
      obj.title = val.brand + val.name
      obj.id = val.id
      obj.activeArr = val.promotion_names
      obj.sellOut = false
      obj.productType = productType

      let processImage = val.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }
      obj.img = processImage

      // 加上库存状态
      if (onSellIds.indexOf(val.productmain_id) < 0) {
        obj.sellOut = true
      }

      if (flashSaleId) {
        obj.flashSaleId = flashSaleId
      }

      this.saveItemData(obj, rowIndex, 'product')
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows,
      gridsDataIndex: this.data.gridsDataIndex
    })
  },

  /**
   * 点击进入对应页面
   */
  clickNavigateToPage: function(e) {
    const url = e.currentTarget.dataset.url

    if (url) {
      Taro.navigateTo({
        url: url
      })
    }
  },

  /**
   * 点击先判断商品是闪购还是正常单品
   */
  linkToProductInfo: function(e) {
    const id = e.currentTarget.dataset.id
    const gridsDataIndex = this.data.gridsDataIndex[id]
    const productObj = this.data.gridsData[gridsDataIndex]

    if (productObj.productType == 'default') {
      this.navigateToProductDetail(id)
    } else if (productObj.productType == 'flashSale') {
      const flashSaleId = productObj.flashSaleId
      this.navigateToFlashSaleProductDetail(id, flashSaleId)
    }
  },

  /**
   * 进入闪购商品详情
   */
  navigateToFlashSaleProductDetail: function(id, flashsaleId) {
    Taro.navigateTo({
      url:
        '/packageA/product/detail/detail?flashsale_id=' +
        flashsaleId +
        '&id=' +
        id
    })
  },

  /**
   * 点击进入普通商品详情
   */
  navigateToProductDetail: function(id) {
    Taro.navigateTo({
      url: '/packageA/product/detail/detail?id=' + id
    })
  },

  /**
   * 点击跳到锚点处
   */
  clickToAnchor: function(e) {
    const anchorText = e.currentTarget.dataset.anchor
    this.setData({
      anchorText: anchorText
    })
  },

  /**
   * 滚动屏幕
   */
  scrollView: function(e) {
    const screenHeight = this.data.screenHeight
    const scrollTop = e.detail.scrollTop

    if (scrollTop >= screenHeight) {
      this.setData({
        showReturnTop: true
      })
    } else {
      this.setData({
        showReturnTop: false
      })
    }
  },

  /**
   * 点击跳到顶部
   */
  clickToScrollTop: function() {
    this.setData({
      scrollTop: 0
    })
  }
}

const assignedObject = util.assignObject(pageData, returnToHome, getCouponModel)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    enablePullDownRefresh: false,
    navigationBarTitleText: '汉光购物'
  }

  render() {
    const {
      anchorText: anchorText,
      scrollTop: scrollTop,
      gridsRows: gridsRows,
      gridsData: gridsData,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome,
      isLoading: isLoading,
      gridsPageId: gridsPageId,
      dialogGetCoupon: dialogGetCoupon,
      user_hasToken: user_hasToken
    } = this.state
    return (
      <Block>
        <ScrollView
          scrollWithAnimation
          enableBackToTop
          scrollY
          scrollIntoView={anchorText}
          id="product-detail-top"
          style="height:100vh"
          onScroll={this.scrollView}
          scrollTop={scrollTop}
        >
          {gridsRows.map((row, rowIndex) => {
            return (
              <Block key={'grids-row-' + rowIndex}>
                {row.point_name ? (
                  <View id={row.point_name}>
                    {row.nodeType == 'image' ? (
                      <Block>
                        <DisplayImageTmpl
                          data={{
                            chunkArr: (row.item, gridsData)
                          }}
                        ></DisplayImageTmpl>
                      </Block>
                    ) : (
                      <Block>
                        {row.displayType == 'swiper' ? (
                          <Block>
                            <DisplayProductSwiperTmpl
                              data={{
                                row: (row, gridsData)
                              }}
                            ></DisplayProductSwiperTmpl>
                          </Block>
                        ) : (
                          <Block>
                            <DisplayProductDefaultTmpl
                              data={{
                                row: (row, gridsData)
                              }}
                            ></DisplayProductDefaultTmpl>
                          </Block>
                        )}
                      </Block>
                    )}
                  </View>
                ) : (
                  <View>
                    {row.nodeType == 'image' ? (
                      <Block>
                        <DisplayImageTmpl
                          data={{
                            chunkArr: (row.item, gridsData)
                          }}
                        ></DisplayImageTmpl>
                      </Block>
                    ) : (
                      <Block>
                        {row.displayType == 'swiper' ? (
                          <Block>
                            <DisplayProductSwiperTmpl
                              data={{
                                row: (row, gridsData)
                              }}
                            ></DisplayProductSwiperTmpl>
                          </Block>
                        ) : (
                          <Block>
                            <DisplayProductDefaultTmpl
                              data={{
                                row: (row, gridsData)
                              }}
                            ></DisplayProductDefaultTmpl>
                          </Block>
                        )}
                      </Block>
                    )}
                  </View>
                )}
              </Block>
            )
          })}
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
          {isLoading != '' && (
            <Block>
              <View className="list-foot">
                {isLoading == 'nomore' ? (
                  <Block>没有更多了</Block>
                ) : (
                  <Block>加载中...</Block>
                )}
              </View>
            </Block>
          )}
        </ScrollView>
        {gridsPageId == 1 && (
          <View className="grids-bar">
            <Image
              mode="widthFix"
              src={require('../../image/gridsImg/sport.png')}
              data-anchor="sport"
              onClick={this.clickToAnchor}
            ></Image>
            <Image
              mode="widthFix"
              src={require('../../image/gridsImg/brand.png')}
              data-anchor="brand"
              onClick={this.clickToAnchor}
            ></Image>
            <Image
              mode="widthFix"
              src={require('../../image/gridsImg/shoe.png')}
              data-anchor="shoe"
              onClick={this.clickToAnchor}
            ></Image>
            <Image
              mode="widthFix"
              src={require('../../image/gridsImg/clothes.png')}
              data-anchor="clothes"
              onClick={this.clickToAnchor}
            ></Image>
            <Image
              mode="widthFix"
              src={require('../../image/gridsImg/skinproduct.png')}
              data-anchor="skinproduct"
              onClick={this.clickToAnchor}
            ></Image>
            <Image
              mode="widthFix"
              src={require('../../image/gridsImg/more.png')}
              data-anchor="more"
              onClick={this.clickToAnchor}
            ></Image>
          </View>
        )}
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
      </Block>
    )
  }
}

export default _C
