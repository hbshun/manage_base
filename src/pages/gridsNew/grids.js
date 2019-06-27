import Taro from '@tarojs/taro'
// packageA/grids/grids.js
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import returnToHome from '../../component/returnToHome/returnToHome.js'
import getCouponModel from '../../component/getCoupon/index.js'
import showSearch from './module/showSearch/showSearch.js'
import brandList from './module/brandList/brandList.js'
import displayImageCarousel from './module/displayImageCarousel/displayImageCarousel.js'
import GIO_utils from '../../utils/GIO_utils.js'
const app = Taro.getApp()
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    //自定义tabbar
    tabbar: {},
    //底部分页相关
    timer: null,
    isBottom: false,
    status: [],
    //锚点跳转相关
    moveToId: 634,
    timer2: null,
    isHome: true,
    //新内容
    backgroundColor: '', // 田字格背景颜色
    backgroundImage: '', // 田字格背景图片
    pageSize: 10000, // 一次获取的网格行数(无限大，一次取完所有数目)
    gridsPageId: 0, // 田字格Id
    showReturnTop: false, // 控制是否显示回到顶部
    screenHeight: 900, // 超过这个高度就显示回到顶部
    scrollTop: 0, // 滚动到指定位置
    gridsData: [], // 每个网格对象的详细内容存放的地方
    gridsRows: [], // 网格整体架构，按每行划分（单品罗列按块划分）
    productIdAndUrl: {}, // 由productId(单品)拿到跳转地址
    ANCHORTYPEID: 9, // 写死：当url_type_id == 9的时候，该跳转链接为页面内跳转
    windowWidth: 0, // 屏幕宽
    anchorText: '', // 锚点
    is_index: true, // 是否是首页
    scroll_view_height: '100vh' // scroll_view的高，需要设置高才能实现锚点功能，但是如果设置了高，就不能使用原生的下俩刷新
  },

  // 给GIO传的数据都放到对应的列上，如果该列是商品，则从product_and_GIO_info对象取
  page_name: '', // 页面名称
  page_type: 'gp', // gp或者首页
  product_and_GIO_info: {}, // 由productId(单品)拿到传递给GIO的数据
  scroll_top: 0, // 页面滚动距离
  timestamp: '', // 上次刷新的时间戳(因为有时候bindscrolltoupper会连续调用，会导致刚刚设置好的gridsRows又被设置为空，导致赋值错误，所以设定本次刷新至少距离上次刷新1秒)

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.clickToScrollTop()
    this.timestamp = new Date().getTime()

    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    if (options.share_param) {
      wx.globalData.userSimpleInfo.share_param = options.share_param
    }

    if (options.id) {
      // 带id的是gp大页
      this.isHome = false
      const gridsPageId = options.id
      this.data.gridsPageId = gridsPageId
      this.data.is_index = false
      this.getGridsData()
      util.printLog('wechat_app', 'go_to_grids', gridsPageId)

      //gp页获取领券活动信息
      this.initGetCoupon('GP_DETAIL', options.id)
    } else {
      // 不带id的是首页
      this.isHome = true
      this.getIndexGPData()
      //首页获取领券活动信息(下边还有一个initGetCoupon，在下拉刷新函数里)
      this.initGetCoupon('HOME_PAGE')
    }

    this.judgeAndShowReturnToHome(options)

    this.getWindowWidth()
    // app.changeTabBar();
  },

  /**
   * 下拉刷新页面
   */

  onPullDownRefresh: function() {
    const is_index = this.data.is_index

    this.data.gridsData = []
    this.data.gridsRows = []
    this.data.productIdAndUrl = {}

    if (is_index) {
      this.getIndexGPData()
      //首页获取领券活动信息(上边还有一个initGetCoupon，在onLoad里)
      // this.initGetCoupon();
    } else {
      this.getGridsData()

      //gp页获取领券活动信息(上边还有一个initGetCoupon，在onLoad里)
      // if (options.id == '1') {
      //   this.initGetCoupon();
      // }
    }
  },
  /***
   * 加载后跳到锚点位置
   */
  onReady() {
    if (this.isHome == false) {
      this.moveTo()
    }
    this.getCart()
  },

  //上拉加载事件
  scroll_to_bottom() {
    const _this = this
    this.data.timer = setTimeout(() => {
      let length = this.data.gridsRows.length
      let lastRow = this.data.gridsRows[length - 1]
      //如果最后一个模块是热销单品瀑布流，加载更多数据
      if (
        lastRow.nodeType == 'products' &&
        lastRow.displayType == 'waterfall_2'
      ) {
        Taro.getStorage({
          key: 'next',
          success: function(res) {
            if (res.data) {
              Taro.showToast({
                icon: 'loading',
                title: '正在加载中...',
                duration: 500,
                mask: true
              })

              _this.data.isBottom = true
              _this.handleHotProducts(res.data, length - 1)
            } else {
              Taro.showToast({
                icon: 'none',
                title: '没有更多了',
                duration: 1000,
                mask: true
              })
            }
          }
        })
      }
    }, 500)
  },
  /**
   * scroll_view触顶，把scroll_view的高度设置为空，好实现下拉刷新
   */
  scroll_to_top: function() {
    const old_timestamp = this.timestamp
    const now_timestamp = new Date().getTime()

    if (now_timestamp - old_timestamp > 2000) {
      this.timestamp = now_timestamp
      Taro.startPullDownRefresh()
    }
  },

  /**
   * 获得屏幕的宽
   */
  getWindowWidth() {
    let windowWidth = 0
    Taro.getSystemInfo({
      success: function(res) {
        windowWidth = res.windowWidth
      }
    })
    // 错了  constant.rpaRtio不是一个确定值2  而是应该获取的
    // this.data.windowWidth = windowWidth * constant.rpxRatio;
    this.data.windowWidth = windowWidth
  },

  /**
   * 获得首页的网格数据
   */
  getIndexGPData: function() {
    const _this = this

    // 这里必须得加蒙版（防止用户在下拉刷新的时候进行其他操作，或者页面焦点图自己滚动造成报错）
    Taro.showToast({
      icon: 'loading',
      title: '正在加载中...',
      duration: 5000,
      mask: true
    })

    util.request({
      url: constant.getIndexGPData,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        console.log(res.root)
        _this.setGridsSimpleInfo(res.background_color, res.background_image)
        if (res.root.children) {
          _this.handleGridsData(res.root.children)
        }
        _this.data.gridsPageId = res.id
        _this.page_name = res.name
        _this.page_type = '首页'

        if (res.next == null) {
          _this.setData({
            isLoading: 'nomore'
          })
        }

        _this.get_grids_data_finished()
      }
    })
  },

  /**
   * 获得网格数据
   */
  getGridsData: function() {
    const gridsPageId = this.data.gridsPageId
    const pageSize = this.data.pageSize
    const url = constant.getGPData + gridsPageId + '/'

    // 这里必须得加蒙版（防止用户在下拉刷新的时候进行其他操作，或者页面焦点图自己滚动造成报错）
    Taro.showToast({
      icon: 'loading',
      title: '正在加载中...',
      duration: 5000,
      mask: true
    })

    if (url) {
      const _this = this
      util.request({
        url: url,
        method: 'GET',
        hasToken: false,
        success: function(res) {
          console.log(res)
          _this.setGridsSimpleInfo(res.background_color, res.background_image)
          if (res.root.children) {
            _this.handleGridsData(res.root.children)
          }

          if (res.next == null) {
            _this.setData({
              isLoading: 'nomore'
            })
          }
          _this.get_grids_data_finished()
        }
      })
    }
  },

  /**
   * 获取网格数据完成
   */
  get_grids_data_finished: function() {
    const _this = this
    // 推迟2秒关闭下拉刷新和使toast消失，因为如果没渲染完数据之前页面有操作的话，会引起报错
    // 因为如果下拉刷新会设置this.data.gridsRows 为空数组
    //
    //给image或者margin_top等等可以直接从gp大页api数据中拿的数据2秒渲染时间（2s后允许下拉刷新，即设置this.data.gridsRows 为空数组，同时this.data.gridsRows[rowIndex]会变成undefined）
    // 2s的时间给products类型或者topic类型的数据（异步获取占时长）是不够的，所以这部分的预防报错交给recombineProductsData函数里的 “if(row) {” 和saveItemData里的 “if(gridsRows[rowIndex]) {” 和 imageSwiperChange里的“if (this.data.gridsRows[rowIndex]) {”来把门

    Taro.stopPullDownRefresh()
    setTimeout(function() {
      Taro.hideToast()
    }, 2000)
  },

  /**
   * 设置田字格简单信息
   */
  setGridsSimpleInfo: function(backgroundColor, backgroundImage) {
    const backgroundImage_ = backgroundImage ? backgroundImage : ''
    this.setData({
      backgroundColor,
      backgroundImage: backgroundImage_
    })
  },

  /**
   * 分类处理网格信息数据
   */
  handleGridsData: function(data) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const nodeType = row.node_type
      const flow_name = row.name || ''
      const id = row.id
      const displayType = row.display_type
      const backgroundColor = row.row.background_color
        ? row.row.background_color
        : ''
      const backgroundImage = row.row.background_image
        ? row.row.background_image
        : ''

      let rowIndex = 0

      switch (nodeType) {
        case 'image':
          // 图片
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.imageType(row.row, rowIndex)
          break

        case 'products':
          // 单品列表
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.productsType(row.row, rowIndex)
          break

        case 'navi':
          // 导航
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.navbarType(row.row, rowIndex)
          break

        case 'space':
          // 辅助空白
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.spaceType(row.row, rowIndex)
          break

        case 'video':
          // 视频
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.videoType(row.row, rowIndex)
          break

        case 'swiper':
          // 轮播：焦点图
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.swiperType(row.row, rowIndex)
          break

        case 'focus':
          // 焦点图（和swiper表现形式一样，区别在于focus可以按时间过滤掉过期的焦点图，而swiper不可以）
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.focus_type(row.row, rowIndex)
          break

        case 'brand':
          // 品牌列表
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.brandListType(row.row, rowIndex)
          break

        case 'topic':
          // 专题列表
          if (row.row.list_display_type == 'single') {
            // 单期商品对应单行
            rowIndex = this.initRow(
              flow_name,
              nodeType,
              displayType,
              id,
              backgroundImage,
              backgroundColor
            )
            this.topicListType(row.row.parameter, rowIndex)
          } else if (row.row.list_display_type == 'multiple') {
            // 多期专题对应多行
            for (let i = 0; i < row.row.parameter; i++) {
              rowIndex = this.initRow(
                flow_name,
                nodeType,
                displayType,
                id,
                backgroundImage,
                backgroundColor
              )
            }
            // parameter是需要的专题数
            // 这个rowIndex是多期专题中最后一个专题的rowIndex，多期专题中的rowIndex有paramter个（这个和其他类型不一样）
            this.multiple_topic_list_type(row.row.parameter, rowIndex)
          }
          break

        case 'promotion':
          // 活动
          break

        case 'search':
          // 搜索
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.searchType(row.row, rowIndex)
          break

        case 'brandwall':
          // 品牌墙
          rowIndex = this.initRow(
            flow_name,
            nodeType,
            displayType,
            id,
            backgroundImage,
            backgroundColor
          )
          this.brandwallType(row.row, rowIndex)
          break
      }
    }
  },

  /**
   * 初始化一行（如果是单品罗列，那么是一块，自动分行，不止一行）
   *  为了保证行不乱，得按顺序占位，占位后再调后台API拿单品数据
   */
  initRow: function(
    flow_name,
    nodeType,
    displayType,
    id,
    backgroundImage,
    backgroundColor
  ) {
    let rowObj = {}
    rowObj.flow_name = flow_name
    rowObj.nodeType = nodeType
    rowObj.displayType = displayType
    rowObj.rowId = 'id' + id
    rowObj.backgroundColor = backgroundColor
    rowObj.backgroundImage = backgroundImage
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
  saveItemData: function(obj, rowIndex) {
    let gridsData = this.data.gridsData
    let gridsRows = this.data.gridsRows
    gridsData.push(obj)

    const gridsDataIndex = gridsData.length - 1

    // 这个是为了防止因为下拉刷新页面设置的this.data.gridsRows = []，会造成gridsRows[rowIndex] == undefined
    if (gridsRows[rowIndex]) {
      gridsRows[rowIndex].item.push(gridsDataIndex)
    }
  },
  /***
   * 首页显示购物车数量
   */
  getCart: function() {
    const _this = this
    util.request({
      url: constant.cart,
      method: 'GET',
      success: function(data) {
        let all_num = 0
        for (let i = 0; i < data.brand_count; i++) {
          let productsCount = data.brands[i].products
          for (let m = 0; m < productsCount.length; m++) {
            all_num += productsCount[m].quantity
          }
        }
        console.log(all_num)
        Taro.setStorageSync('cart_num', all_num)
        // _this.tabbar.cart_num = all_num
      }
    })
  },
  /**
   * 返回是否跳转页面是导航栏的页面
   */
  isNavbar: function(url) {
    let isNavbar = false

    if (url.indexOf('/pages/index/index') > -1) {
      isNavbar = true
    }
    if (url.indexOf('/pages/category/category') > -1) {
      isNavbar = true
    }
    if (url.indexOf('/pages/brand/index/index') > -1) {
      isNavbar = true
    }
    if (url.indexOf('/pages/cart/index/index') > -1) {
      isNavbar = true
    }
    if (url.indexOf('/pages/usercenter/index/index') > -1) {
      isNavbar = true
    }

    return isNavbar
  },

  /**
   * 处理搜索类型数据
   */
  searchType: function(row, rowIndex) {
    let obj = {}
    // const placeholder = row.placeholder || '';
    // obj.placeholder = placeholder;
    // obj.url = '/packageA/product/list/list?key=' + placeholder;
    // row.placeholder = '兰蔻';
    const placeholder = row.placeholder
    if (placeholder) {
      obj.placeholder = placeholder
      obj.url = '/packageA/product/list/list?key=' + placeholder
    } else {
      obj.placeholder = ''
      obj.url = '/pages/searchPage/searchPage'
    }

    obj.for_GIO = {
      flowName_var: this.data.gridsRows[rowIndex].flow_name,
      moduleType_var: this.data.gridsRows[rowIndex].nodeType,
      hrefType_var: 'SEARCH_PAGE',
      hrefContent_var: 'SEARCH_PAGE',
      columnIndex_var: 0,
      rowIndex_var: rowIndex,
      interval_var: ''
    }

    this.saveItemData(obj, rowIndex)

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理品牌墙类型的数据
   */
  brandwallType: function(row, rowIndex) {
    for (let i = 0; i < row.children.length; i++) {
      const item = row.children[i]

      //获取图片地址，优先获取image，如果为空，则获取brand的logo值
      let processImage = ''
      if (item.image) {
        processImage = item.image
      } else {
        processImage = item.brand.logo
      }

      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareS
      }

      //获取品牌墙需要的log，描述、链接地址
      let obj = {}
      obj.logo = processImage
      obj.description = item.description
      obj.destination_url = item.destination_url.url
      obj.for_GIO = this.get_info_for_GIO(rowIndex, item)
      this.saveItemData(obj, rowIndex)
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 根据品牌墙链接地址进行跳转
   */
  redirectToDestination: function(e) {
    const index = e.currentTarget.dataset.index
    const url = this.data.gridsData[index].destination_url
    const interval_var = e.touches[0].pageY + this.scroll_top
    this.post_info_to_GIO('other', index, interval_var)

    if (url) {
      Taro.navigateTo({
        url: url
      })
    }
  },

  /**
   * 处理一行图片罗列类型数据
   */
  imageType: function(row, rowIndex) {
    this.handleImageRowInfo(row, rowIndex)

    let imageMaxHeight = 0

    this.data.gridsRows[rowIndex].col_margin =
      this.data.gridsRows[rowIndex].col_margin + 'rpx'
    for (let i = 0; i < row.children.length; i++) {
      const item = row.children[i]
      let obj = {}
      obj.image = item.image
      obj.url = ''
      if (item.destination_url) {
        obj.url = item.destination_url.url
        if (item.destination_url.url_type_id == this.data.ANCHORTYPEID) {
          obj.target_point = 'id' + item.destination_url.parameter
        }
      }
      obj.for_GIO = this.get_info_for_GIO(rowIndex, item)

      // const width = Math.floor((item.image_width / picWidthSum) * 1000000) / 10000;
      // const width = (item.image_width * constant.rpxRatio / picWidthSum).toFixed(10) * 100;
      // obj.width = width + '%';
      obj.width = item.image_width + 'rpx' ////////////////////////////

      // 这个是个公式：算出当比例不变的情况下，当前赋予的宽度（px）对应的高度（px）
      // obj.height = Math.floor((imageSpaceWidth * width / 100) * item.image_height / item.image_width * 100) / 100;
      obj.height = item.image_height
      // 并且取出一个当行最高高度
      imageMaxHeight = obj.height > imageMaxHeight ? obj.height : imageMaxHeight

      this.saveItemData(obj, rowIndex)
    }

    // 为这行的每一个图片高度都赋予最高的高度，每个图片的高度可能会有细微不一样，因为宽不是精准百分比，所以高度也不精准统一
    for (let i = 0; i < this.data.gridsRows[rowIndex].item.length; i++) {
      const gridsDataIndex = this.data.gridsRows[rowIndex].item[i]
      this.data.gridsData[gridsDataIndex].height = imageMaxHeight + 'rpx'
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理图片行的基础信息
   */
  handleImageRowInfo(row, rowIndex) {
    let {
      padding_left,
      padding_right,
      padding_top,
      padding_bottom,
      col_margin
    } = row
    const { windowWidth } = this.data
    // 算出可以用于展示图片的位置大小,最后以px作为单位
    // const imageSpaceWidth = windowWidth - padding_left - padding_right;
    // 转成rpx单位
    this.data.gridsRows[rowIndex].padding_left = padding_left + 'rpx'
    this.data.gridsRows[rowIndex].padding_right = padding_right + 'rpx'
    this.data.gridsRows[rowIndex].padding_top = padding_top + 'rpx'
    this.data.gridsRows[rowIndex].padding_bottom = padding_bottom + 'rpx'
    this.data.gridsRows[rowIndex].col_margin = col_margin
    // this.data.gridsRows[rowIndex].imageSpaceWidth = imageSpaceWidth;
  },

  /**
   * 处理导航类型数据
   */
  navbarType: function(row, rowIndex) {
    if (row.scroll_type == 'fix') {
      switch (row.display_type) {
        case 'top':
          this.data.gridsRows[rowIndex].type = 'top-fixed'
          break
        case 'bottom':
          this.data.gridsRows[rowIndex].type = 'bottom-fixed'
          break
        case 'absolute':
          this.data.gridsRows[rowIndex].type = 'absolute'
          break
      }
    }

    this.data.gridsRows[rowIndex].navbarHeight = row.height + 'rpx'

    for (let i = 0; i < row.children.length; i++) {
      const item = row.children[i]
      let obj = {}
      obj.image = item.image
      obj.url = ''

      if (item.destination_url) {
        obj.url = item.destination_url.url
        if (item.destination_url.url_type_id == this.data.ANCHORTYPEID) {
          obj.target_point = 'id' + item.destination_url.parameter
        }
      }

      obj.for_GIO = this.get_info_for_GIO(rowIndex, item)

      this.saveItemData(obj, rowIndex)
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理空白数据
   */
  spaceType: function(row, rowIndex) {
    this.data.gridsRows[rowIndex].emptyHeight = row.height + 'rpx'
    this.setData({
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理轮播：焦点图数据
   */
  swiperType: function(row, rowIndex) {
    // 用焦点图第一张图片宽高比例来作为轮播图宽高比例
    let rowHeight = 0
    const rowWidth = this.data.windowWidth
    const imageHeight = row.children[0].image_height
    const imageWidth = row.children[0].image_width
    rowHeight = Math.floor((imageHeight * rowWidth * 100) / imageWidth) / 100

    this.data.gridsRows[rowIndex].rowHeight = rowHeight + 'px' // 用windowWidth协助来算出的width都可以直接用px单位

    this.data.gridsRows[rowIndex].current = 0
    this.data.gridsRows[rowIndex].isAutoplay = row.is_autoplay

    for (let i = 0; i < row.children.length; i++) {
      const item = row.children[i]
      let obj = {}
      obj.image = item.image
      obj.url = ''

      if (item.destination_url) {
        obj.url = item.destination_url.url
        if (item.destination_url.url_type_id == this.data.ANCHORTYPEID) {
          obj.target_point = 'id' + item.destination_url.parameter
        }
      }

      obj.for_GIO = this.get_info_for_GIO(rowIndex, item)

      this.saveItemData(obj, rowIndex)
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理焦点图数据
   */
  focus_type: function(row, rowIndex) {
    const _this = this
    util.request({
      url: constant.getSwiperData,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        _this.handle_focus_type_data(res, rowIndex)
      }
    })
  },

  /**
   * 处理焦点图数据
   */
  handle_focus_type_data: function(res, rowIndex) {
    // 用焦点图第一张图片宽高比例来作为轮播图宽高比例
    let rowHeight = 0
    const rowWidth = this.data.windowWidth
    const imageHeight = 460 // 因为临时解决方案没有传入图片高度，所以比例固定
    const imageWidth = 1080 // 比例固定
    rowHeight = Math.floor((imageHeight * rowWidth * 100) / imageWidth) / 100

    this.data.gridsRows[rowIndex].rowHeight = rowHeight + 'px' // 用windowWidth协助来算出的width都可以直接用px单位

    this.data.gridsRows[rowIndex].current = 0
    this.data.gridsRows[rowIndex].isAutoplay = 'true'

    for (let i = 0; i < res.length; i++) {
      const item = res[i]
      let obj = {}
      obj.image = item.image
      obj.url = ''

      if (item.destination_url) {
        obj.url = item.destination_url.url
      }

      obj.for_GIO = this.get_info_for_GIO(rowIndex, item)

      this.saveItemData(obj, rowIndex)
    }

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理video类型数据
   */
  videoType: function(row, rowIndex) {
    this.data.gridsRows[rowIndex].video = row.link
    this.data.gridsRows[rowIndex].videoImage = row.image

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理品牌列表类型数据
   */
  brandListType: function(row, rowIndex) {
    this.getHotBrandData(rowIndex)
  },

  /**
   * 处理多个专题列表数据
   */
  multiple_topic_list_type: function(length, last_row_index) {
    const _this = this

    util.request({
      url: constant.getTopicData,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        // const topic_arr = res.slice(0, length - 1)
        // _this.handle_multiple_topic_list_data(topic_arr. rowIndex);
        const new_length = res.length - length > 0 ? length : res.length
        for (let i = 0; i < new_length; i++) {
          const row_index = last_row_index - (new_length - i - 1)
          _this.topicListType(res[i].id, row_index)
        }
      }
    })
  },

  /**
   * 处理简单版专题列表数据（不用查库存，全有货）
   */
  topicListType: function(topic_id, rowIndex) {
    const _this = this
    let topicRow = this.data.gridsRows[rowIndex]
    topicRow.url = '/packageA/topic/topic?topic=' + topic_id

    util.request({
      url: constant.getSimpleProductData + topic_id + '/?page_size=10',
      method: 'GET',
      hasToken: false,
      success: function(res) {
        topicRow.imgUrl = res.image
        topicRow.title = res.name
        topicRow.subTitle = res.description

        // 前面有个定义，两次刷新间隔至少2秒
        // 每次刷新都会清空_this.data.gridsRows，如果网还是很慢第一次刷新的数据在第二次刷新后才返回
        // 那么会导致_this.data.gridsRows[rowIndex]为undefined
        if (_this.data.gridsRows[rowIndex]) {
          topicRow.for_GIO = {
            flowName_var: _this.data.gridsRows[rowIndex].flow_name,
            moduleType_var: _this.data.gridsRows[rowIndex].nodeType,
            hrefType_var: 'TOPIC_PAGE',
            hrefContent_var: topic_id,
            columnIndex_var: 0,
            rowIndex_var: rowIndex,
            interval_var: ''
          }

          _this.handleTopicProductsListData(res.products, rowIndex, 'default')
        }
      }
    })
  },

  /**
   * 处理简单版产品列表数据（不用查库存，全有货）
   */
  handleTopicProductsListData: function(products, rowIndex, productType) {
    let productArr = []

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

      // 这里有个坑，如果同一页面同一个商品，在一个地方是闪购商品，而在另一个地方是正常商品，那么有效值只有一个，就是最后被更改的那次
      this.data.productIdAndUrl[obj.id] =
        '/packageA/product/detail/detail?id=' + obj.id

      this.fill_product_and_GIO_info(rowIndex, productArr.length, val)

      productArr.push(obj)
    }

    // product特殊，因为使用了其他页面的组件，为了兼容其他页面，不用saveItemData的方法组数据，另组。
    // node_type=='products'的行item只有一项，指向gridsData[index]，gridsData[index]里是该块的所有商品完整数据

    this.recombineProductsData(productArr, rowIndex)

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 为商品添加给GIO发送的信息
   */
  fill_product_and_GIO_info: function(row_index, column_index, val) {
    // 前面有个定义，两次刷新间隔至少2秒
    // 每次刷新都会清空_this.data.gridsRows，如果网还是很慢第一次刷新的数据在第二次刷新后才返回
    // 那么会导致_this.data.gridsRows[rowIndex]为undefined
    if (this.data.gridsRows[row_index]) {
      this.product_and_GIO_info[val.id] = {
        moduleType_var: this.data.gridsRows[row_index].nodeType,
        flowName_var: this.data.gridsRows[row_index].flow_name,
        hrefType_var: 'PRODUCT_DETAIL',
        hrefContent_var: val.id,
        columnIndex_var: column_index,
        rowIndex_var: row_index,
        interval_var: ''
      }
    }
  },

  /**
   * 处理商品列表行的类型数据
   */
  productsType: function(row, rowIndex) {
    const _this = this

    const { list_type, parameter, quantity, display_type } = row
    let url = ''

    // 前面有个定义，两次刷新间隔至少2秒
    // 每次刷新都会清空_this.data.gridsRows，如果网还是很慢第一次刷新的数据在第二次刷新后才返回
    // 那么会导致_this.data.gridsRows[rowIndex]为undefined
    if (this.data.gridsRows[rowIndex]) {
      this.data.gridsRows[rowIndex].displayType = display_type

      switch (list_type) {
        case 'brand':
          // 品牌ok
          url =
            constant.getBrandProductsList2 +
            '?brand_id=' +
            parameter +
            '&page_size=' +
            quantity
          this.handleBrandTypeProducts(url, rowIndex)
          break

        case 'topic':
          // 专题商品列表ok
          url =
            constant.getSimpleProductData +
            parameter +
            '/?page_size=' +
            quantity
          this.handleTopicTypeProducts(url, rowIndex)
          break

        case 'flashsale':
          // 固定某期闪购商品列表ok
          url =
            constant.flashSaleList +
            '?id=' +
            parameter +
            '&page_size=' +
            quantity
          this.handleFlashSaleTypeData(url, rowIndex, parameter)
          break

        case 'current_flashsale':
          // 当前闪购列表ok
          url = constant.getFlashsaleData + '?page_size=' + quantity
          this.handleCurrentFlashSaleTypeData(url, rowIndex)
          break

        case 'category':
          // 分类商品列表 ok
          // row.category
          url = constant.getProductList
          this.handleCategoryTypeData(url, rowIndex, parameter, quantity)
          break

        case 'new_product':
          // 上新ok
          url = constant.getFreshProductData + '?page_size=' + quantity
          this.handleNewProducts(url, rowIndex)
          break

        case 'hot_product':
          // 拿热销单品数据

          url = constant.getSkuListData + '?page_size=' + quantity

          this.handleHotProducts(url, rowIndex)

          break
      }
    }
  },

  /**
   * 处理品牌单品类型数据
   */
  handleBrandTypeProducts: function(url, rowIndex) {
    const _this = this

    util.request({
      url: url,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        _this.getProductsSellStatus(res.results.products, rowIndex)
      }
    })
  },

  /**
   * 处理专题类型商品
   */
  handleTopicTypeProducts: function(url, rowIndex) {
    const _this = this
    util.request({
      url: url,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        // _this.getProductsSellStatus(res.results, rowIndex);
        _this.handleTopicProductsListData(res.products, rowIndex, 'default')
      }
    })
  },

  /**
   * 处理分类单品类型数据
   */
  handleCategoryTypeData: function(url, rowIndex, category, quantity) {
    const _this = this
    let postObj = {
      keyword: '', // 初始的搜索字
      filters: {},
      page: 0,
      sort: {
        default: ''
      },
      page_size: quantity
    }

    postObj.filters.categories = [category]

    util.request({
      url: url,
      method: 'POST',
      hasToken: false,
      data: postObj,
      success: function(res) {
        _this.getProductsSellStatus(res.results.products, rowIndex)
      }
    })
  },

  /**
   * 处理闪购单品类型数据
   */
  handleFlashSaleTypeData: function(url, rowIndex, flashSaleId) {
    const _this = this

    util.request({
      url: url,
      method: 'GET',
      hasToken: false,
      success: res => {
        _this.getFlashSaleProductsSellStatus(
          res.results.products,
          rowIndex,
          flashSaleId
        )
      }
    })
  },

  /**
   * 处理当期闪购单品类型数据
   */
  handleCurrentFlashSaleTypeData: function(url, rowIndex) {
    const _this = this
    util.request({
      url: url,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        const flashsaleId = res.length > 0 ? res[0].flashsale_id : 0
        _this.handleCurrentFlashsaleProductsListData(
          res,
          rowIndex,
          'flashSale',
          flashsaleId
        )
      }
    })
  },

  /**
   * 处理当期闪购单品类型数据（这个不用请求查看库存）
   */
  handleCurrentFlashsaleProductsListData: function(
    products,
    rowIndex,
    productType,
    flashSaleId
  ) {
    let productArr = []

    for (let i = 0; i < products.length; i++) {
      let obj = {}
      const val = products[i]
      obj.originalPrice = val.flashsale.price
      obj.retailPrice = val.flashsale.price
      obj.title = val.brand + val.name
      obj.id = val.id
      obj.activeArr = [] /// 注意
      obj.sellOut = false
      obj.productType = productType

      let processImage = val.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }
      obj.img = processImage

      // 这里有个坑，如果同一页面同一个商品，在一个地方是闪购商品，而在另一个地方是正常商品，那么有效值只有一个，就是最后被更改的那次

      this.data.productIdAndUrl[obj.id] =
        '/packageA/product/detail/detail?flashsale_id=' +
        flashSaleId +
        '&id=' +
        obj.id

      this.fill_product_and_GIO_info(rowIndex, productArr.length, val)

      productArr.push(obj)
    }

    // product特殊，因为使用了其他页面的组件，为了兼容其他页面，不用saveItemData的方法组数据，另组。
    // node_type=='products'的行item只有一项，指向gridsData[index]，gridsData[index]里是该块的所有商品完整数据

    this.recombineProductsData(productArr, rowIndex)

    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 处理上新单品类型数据
   */
  handleNewProducts: function(url, rowIndex) {
    const _this = this
    util.request({
      url: url,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        _this.getProductsSellStatus(res.results, rowIndex)
      }
    })
  },

  /**
   * 处理热销单品类型数据
   */
  handleHotProducts: function(url, rowIndex) {
    const _this = this
    util.request({
      url: url,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        //拿到所有的热销单品hot_products，处理
        if (res.next) {
          Taro.setStorage({
            key: 'next',
            data: res.next
          })
        } else {
          Taro.setStorage({
            key: 'next',
            data: null
          })
        }

        _this.getProductsSellStatus(res.results, rowIndex)
      }
    })
  },

  /**
   * 给数据加上库存状态
   */
  getProductsSellStatus: function(data, rowIndex) {
    //data为拿到的所有的单品数据
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
    let productArr = []

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

      // 这里有个坑，如果同一页面同一个商品，在一个地方是闪购商品，而在另一个地方是正常商品，那么有效值只有一个，就是最后被更改的那次
      this.data.productIdAndUrl[obj.id] =
        '/packageA/product/detail/detail?id=' + obj.id
      if (productType == 'flashSale') {
        obj.retailPrice = val.flashsale.price
        obj.originalPrice = val.flashsale.price
        obj.activeArr = []
        this.data.productIdAndUrl[obj.id] =
          '/packageA/product/detail/detail?flashsale_id=' +
          flashSaleId +
          '&id=' +
          obj.id
      }

      this.fill_product_and_GIO_info(rowIndex, productArr.length, val)

      productArr.push(obj)
    }

    // product特殊，因为使用了其他页面的组件，为了兼容其他页面，不用saveItemData的方法组数据，另组。
    // node_type=='products'的行item只有一项，指向gridsData[index]，gridsData[index]里是该块的所有商品完整数据
    this.recombineProductsData(productArr, rowIndex)
    this.setData({
      gridsData: this.data.gridsData,
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * products类型的为了显示的需要，需重组数据
   */
  recombineProductsData: function(productArr, rowIndex) {
    const row = this.data.gridsRows[rowIndex]

    // 这个是为了防止因为下拉刷新页面设置的this.data.gridsRows = []，会造成this.data.gridsRows[rowIndex] == undefined
    if (row) {
      const displayType = row.displayType
      if (row.nodeType == 'topic') {
        // topic类型处理成单张大图滑动模式
        const obj = productArr.shift()
        row.mainProduct = obj
        productArr.push({
          type: 'linkMore'
        })
        this.swiperArr(2, productArr, rowIndex)
      } else {
        // products类型
        switch (displayType) {
          case 'waterfall_2':
            // 两件瀑布流

            if (this.data.isBottom == true) {
              let old_gridsData = this.data.gridsData[
                this.data.gridsRows[rowIndex].item[0]
              ]

              this.data.gridsData[this.data.gridsRows[rowIndex].item[0]] = [
                ...old_gridsData,
                ...productArr
              ]

              this.setData({
                gridsData: this.data.gridsData
              })

              return
            }
            this.saveItemData(productArr, rowIndex)
            break

          case 'waterfall_3':
            // 三件瀑布流
            this.saveItemData(productArr, rowIndex)
            break

          case 'scroll_view':
            // 横向滑动
            this.saveItemData(productArr, rowIndex)
            break

          case 'swiper_2':
            // 2件轮播
            this.swiperArr(2, productArr, rowIndex)
            break

          case 'swiper_3':
            // 3件轮播
            this.swiperArr(3, productArr, rowIndex)
            break

          case 'swiper_6':
            // 6件轮播
            this.swiperArr(6, productArr, rowIndex)
            break
        }
      }
    }
  },

  /**
   * 把一维数组变为二维数组
   */
  swiperArr: function(num, productArr, rowIndex) {
    this.data.gridsRows[rowIndex].current = 0

    let arrLength = Math.ceil(productArr.length / num)
    let newArr = []

    for (let i = 0; i < arrLength; i++) {
      newArr[i] = []
    }

    for (let j = 0; j < productArr.length; j++) {
      newArr[parseInt(j / num)][j % num] = productArr[j]
    }

    this.saveItemData(newArr, rowIndex)
  },

  /**
   * 点击先判断是不是普通商品
   */
  linkToProductInfo: function(e) {
    const id = e.currentTarget.dataset.id
    let url = ''
    if (id) {
      // 有id的是普通商品
      url = this.data.productIdAndUrl[id]
      const interval_var = e.touches[0].pageY + this.scroll_top
      this.post_info_to_GIO('product', id, interval_var)

      if (url) {
        Taro.navigateTo({
          url: url
        })
      }
    } else if (e.currentTarget.dataset.jumpType) {
      // 特殊跳转
      const event = {
        currentTarget: {
          dataset: {
            dataIndex: e.currentTarget.dataset.dataIndex || 0
          }
        },
        touches: [
          {
            pageY: e.touches[0].pageY
          }
        ]
      }

      this.special_jump(event)
    }
  },

  /**
   * 处理特殊跳转
   */
  special_jump: function(e) {
    const row_index = e.currentTarget.dataset.dataIndex
    const interval_var = e.touches[0].pageY + this.scroll_top
    const url = this.data.gridsRows[row_index].url
    this.post_info_to_GIO('special', row_index, interval_var)

    if (url) {
      Taro.navigateTo({
        url: url
      })
    }
  },

  /**
   * 进来时跳转到某一位置
   *
   */
  moveTo() {
    const move_to_id = this.data.moveToId
    console.log(move_to_id)

    this.timer2 = setTimeout(() => {
      this.setData({
        anchorText: 'id' + move_to_id
      })
    }, 2000)
  },
  /**
   * 跳转到本页其他地方或者跳到别的页面
   */
  turnToOrderPage: function(e) {
    const index = e.currentTarget.dataset.dataIndex
    const interval_var = e.touches[0].pageY + this.scroll_top
    const { gridsData } = this.data

    this.post_info_to_GIO('other', index, interval_var)

    if (gridsData[index].target_point) {
      // 锚点
      this.setData({
        anchorText: gridsData[index].target_point
      })
    } else {
      if (gridsData[index].url) {
        const isNavbar = this.isNavbar(gridsData[index].url)
        if (isNavbar) {
          // 跳到导航栏配置的页面
          Taro.switchTab({
            url: gridsData[index].url
          })
        } else {
          Taro.navigateTo({
            url: gridsData[index].url
          })
        }
      }
    }
  },

  /**
   * 滚动屏幕
   */
  // scrollView: function(e) {

  //   const screenHeight = this.data.screenHeight;
  //   const scrollTop = e.detail.scrollTop;

  //   if (this.selectComponent('#c-search')) {
  //     this.selectComponent('#c-search').scrollPageChangeSearch(scrollTop);
  //   }

  //   if (scrollTop >= screenHeight) {

  //     this.setData({
  //       showReturnTop: true
  //     });
  //   } else {

  //     this.setData({
  //       showReturnTop: false
  //     });
  //   }

  // },

  componentSearch: null,
  componentReturnHomeStatus: false,

  scrollView: function(e) {
    if (!this.componentSearch) {
      this.componentSearch = this.selectComponent('#c-search')
    }

    const screenHeight = this.data.screenHeight
    const scrollTop = e.detail.scrollTop
    this.scroll_top = scrollTop
    // if (scrollTop <= 0) {
    //   this.scroll_to_top();
    // }

    if (this.componentSearch && scrollTop <= 150) {
      this.componentSearch.scrollPageChangeSearch(scrollTop)
    }

    if (scrollTop >= screenHeight && !this.componentReturnHomeStatus) {
      this.componentReturnHomeStatus = true
      this.setData({
        showReturnTop: true
      })
    } else if (scrollTop < screenHeight && this.componentReturnHomeStatus) {
      this.componentReturnHomeStatus = false
      this.setData({
        showReturnTop: false
      })
    }
  },

  /**
   * 商品轮播图改变
   */
  productSwiperChange: function(e) {
    const rowIndex = e.currentTarget.dataset.rowIndex
    this.data.gridsRows[rowIndex].current = e.detail.current
    this.setData({
      gridsRows: this.data.gridsRows
    })
  },

  /**
   * 点击跳到顶部
   */
  clickToScrollTop: function() {
    this.setData({
      scrollTop: 2
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    // GP大页分享给GIO发送信息
    // 首页的分享不在这写（首页分享，GIO有坑，会发两次，所以写到index的分享函数里）
    if (!this.data.is_index) {
      const obj_GIO = {
        sharePage_var: 'GP'
      }
      GIO_utils.send_track_function('shareSuccess', obj_GIO)

      let url_options = {
        channel: '小程序分享',
        pageName: 'GP'
      }

      url_options = this.getCurrentPageParameterToShare(url_options)
      let new_url = util.return_current_url_with_options(url_options)

      return {
        path: new_url
      }
    }
  },

  /**
   * 获得需要发送给GIO的信息
   */
  get_info_for_GIO: function(rowIndex, col) {
    const row = this.data.gridsRows[rowIndex]
    let info = {
      flowName_var: row.flow_name,
      moduleType_var: row.nodeType
    }

    info.hrefType_var = col.destination_url
      ? col.destination_url.url_type.url_type
      : ''
    info.hrefContent_var = col.destination_url
      ? col.destination_url.parameter
      : ''
    info.columnIndex_var = row.item.length
    info.rowIndex_var = rowIndex
    info.interval_var = ''

    return info
  },

  /**
   * 点击流量位后发送信息给GIO
   */
  post_info_to_GIO: function(type, row_index, interval_var) {
    let info_for_GIO = {}

    switch (type) {
      case 'product':
        info_for_GIO = this.product_and_GIO_info[row_index]
        break

      case 'other':
        // 图片，品牌墙等一行有几列的，for_GIO在列里面
        info_for_GIO = this.data.gridsData[row_index].for_GIO
        break

      case 'special':
        // 专题列表头图，专题列表的“查看更多”等比较特殊的，for_GIO在行里
        info_for_GIO = this.data.gridsRows[row_index].for_GIO
    }

    info_for_GIO.interval_var = interval_var
    info_for_GIO.pageName_var = this.page_name
    info_for_GIO.pageId_var = this.data.gridsPageId
    info_for_GIO.pageType_var = this.page_type

    const setEvar_GIO = {
      pageName_evar: info_for_GIO.pageName_var,
      pageType_evar: info_for_GIO.pageType_var,
      moduleType_evar: info_for_GIO.moduleType_var,
      flowName_evar: info_for_GIO.flowName_var,
      hrefContent_evar: info_for_GIO.hrefContent_var,
      hrefType_evar: info_for_GIO.hrefType_var
    }

    GIO_utils.send_track_function('flowClick', info_for_GIO)
    GIO_utils.send_setEvar_function(setEvar_GIO)
  },

  /**
   * 点击gp大页的搜索给GIO发送数据
   */
  click_gp_search: function(e) {
    const index = e.currentTarget.dataset.index
    const interval_var = e.touches[0].pageY + this.scroll_top
    this.post_info_to_GIO('other', index, interval_var)
  }
}

const newPageData = util.assignObject(
  pageData,
  returnToHome,
  getCouponModel,
  showSearch,
  brandList,
  displayImageCarousel
)

export default newPageData
