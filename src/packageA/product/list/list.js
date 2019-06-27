import { Block, View, Icon, Input, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
const util = require('../../../utils/util.js')
const constant = require('../../../config/constant.js')
const chooseFeature = require('../../../component/chooseFeature/chooseFeature.js')
const chooseSpan = require('../../../component/chooseSpan/chooseSpan.js')
import returnTop from '../../../component/returnTop/returnTop.js'
import returnToHome from '../../../component/returnToHome/returnToHome.js'
import user from '../../../utils/user/index.js'
import GIO_utils from '../../../utils/GIO_utils.js'

import ReturnToHomeTmpl from '../../../imports/ReturnToHomeTmpl.js'
import ReturnTopTmpl from '../../../imports/ReturnTopTmpl.js'
import ChooseSpanTmpl from '../../../imports/ChooseSpanTmpl.js'
import ChooseFeatureTmpl from '../../../imports/ChooseFeatureTmpl.js'
import ShopItembTmpl from '../../../imports/ShopItembTmpl.js'
import ShopItemaTmpl from '../../../imports/ShopItemaTmpl.js'
import './list.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    tab: {},
    shopShow: false, // 列表显示
    inputShowed: false, // 搜索栏
    inputVal: '', // 搜索栏上填写的数据
    // searchVal: "口红",// 正在搜索的关键词
    shopData: [], // 传给模板的商品数据
    page: 0, // 当前商品页面（分页获取）
    postObj: {
      keyword: '', // 初始的搜索字
      page: 0,
      sort: {
        default: ''
      }
    },
    isLoading: 'loading', // 页面底部显示loading或者没有更多了
    hasTab: false, // 显示导航栏
    tabShow: {}, // 导航栏显示的内容
    categoryText: '', // 从分类点进列表页的时候选择的分类字段
    canShare: 1, // 是否可以分享（商品列表页是可以被分享出去的，因为品牌有些含有&，筛选后生成分享字符串含有&会有错误，因此品牌在这里传的是brand_id而不是name，这里和购物车里的因活动进入的搜索引擎页面不一样）
    printLogData: {} // 向后台发送的数据
  },

  shop_name: null, // 商品链接里有可能带着的柜号

  search_source_GIO: '',
  search_type_GIO: '商品列表页',
  click_filter_other_GIO: [],
  click_filter_arrange_GIO: {},
  product_data_GIO: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this

    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    this.shop_num = options.shop_num || null

    this.judgeAndShowReturnToHome(options)

    if (options.from_sold_out) {
      // 来自下架商品的去逛逛，这个是个特殊的情况
      this.setData(
        {
          showReturnToHome: true
        },
        function() {
          _this.searchSend()
        }
      )

      this.search_source_GIO = '购物车为空'
    } else if (options.from_share) {
      const postObj = JSON.parse(decodeURIComponent(options.share_search))
      this.setData(
        {
          inputShowed: false,
          inputVal: postObj.keyword,
          fromShareData: postObj
        },
        function() {
          const shareFirstR = 1 // 这个是要传递到处理shopData的地方，如果有shareFirstR这个参数，request之后只处理tab数据，不处理product数据（shopData），因为第一次的reques是不带参数只带key的request，产生的shopData如果被显示则是不对的

          _this.searchSend(shareFirstR)
        }
      )

      this.search_source_GIO = '分享'
    } else if (options.key) {
      // 从首页的点击搜索，分类的点击搜索进入，带输入数据
      const _key = decodeURI(options.key)
      const _this = this

      this.setData(
        {
          inputShowed: false,
          inputVal: _key
        },
        function() {
          _this.searchSend()
        }
      )

      this.search_source_GIO = '首页、分类页面的搜索栏（带搜索数据）'
    } else if (options.category) {
      // 从分类点击具体分类图标进入

      this.data.postObj.filters = {}
      this.data.postObj.filters.categories = [options.category]
      this.data.categoryText = options.category
      this.categorySearch()
      this.search_source_GIO = '分类页面的分类图标'
    } else {
      // 从首页的点击搜索，分类的点击搜索进入，不带输入数据
      this.getData(this.dataToTab)
      this.search_source_GIO = '首页、分类页面的搜索栏（不带搜索数据）'
    }

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
  onShow: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // page设置为0
    this.setData({
      page: 0,
      shopData: []
    })

    this.getData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.isLoading == 'nomore') {
      return
    }

    this.getData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const obj_GIO = {
      sharePage_var: '商品列表'
    }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    const title = this.data.postObj.keyword
    const obj = JSON.stringify(this.data.postObj)
    const str = encodeURIComponent(obj)
    let url_options = {
      channel: '小程序分享',
      pageName: '商品列表',
      share_search: str
    }

    url_options = this.getCurrentPageParameterToShare(url_options)
    let new_url = util.return_current_url_with_options(url_options)

    return {
      title: title,
      path: new_url
    }
  },

  /**
   * 修改商品显示样式
   */
  showType: function() {
    this.setData({
      shopShow: !this.data.shopShow
    })
  },

  /**
   * 展示选择商品下拉panel
   */
  showTab: function(event) {
    const tab = this.data.tab

    if (tab.tabShow == event.target.dataset.hi) {
      tab.tabShow = ''
    } else {
      tab.tabShow = event.target.dataset.hi
    }

    this.setData({
      tab: tab
    })
  },

  /**
   * 点击灰色区域隐藏tab
   */
  hideTab: function() {
    const tab = this.data.tab
    tab.tabShow = ''
    this.setData({
      tab
    })
  },

  /**
   * 搜索栏
   */
  showInput: function() {
    this.setData({
      inputShowed: true
    })
  },
  hideInput: function() {
    this.setData({
      inputVal: '',
      inputShowed: false
    })
  },
  clearInput: function() {
    this.setData({
      inputVal: ''
    })
    this.outSearchSend()
    // this.hideInput();
  },
  inputTyping: function(e) {
    const postObj = {
      keyword: '', // 初始的搜索字
      page: 0,
      sort: {
        default: ''
      }
    }

    this.setData({
      postObj,
      inputVal: e.detail.value
    })
  },

  outSearchSend: function() {
    this.searchSend()
  },

  searchSend: function(shareFirstR) {
    const value = this.data.inputVal
    let postObj = this.data.postObj
    postObj.keyword = value

    util.printLog('wechat_app', 'search', value)

    this.setData({
      postObj: postObj,
      page: 0,
      shopData: []
    })

    // GIO（点击搜索）
    const searchKeywords_evar = value
    wx.globalData.gio('setEvar', {
      searchKeywords_evar
    })

    if (shareFirstR) {
      this.getData(this.dataToTab, shareFirstR)
    } else {
      this.getData(this.dataToTab)
    }

    // this.addSearchHistoryList(value);
    this.judgeTokenStatus(value)
  },

  /**
   * 先判断token是否有效，如果有效就向后台发送搜索历史，如果无效也不要做处理
   */
  judgeTokenStatus: function(value) {
    util.judgeTokenStatus(
      res => {
        this.addSearchHistoryList(value)
      },
      () => {}
    )
  },

  /**
   * 添加搜索历史列表
   */
  addSearchHistoryList: function(value) {
    let str = ''

    if (value) {
      str = value.replace(/\s+/g, '')
    }

    if (str != '') {
      const _this = this

      util.request({
        url: constant.default.getSearchHistory,
        method: 'POST',
        data: {
          keyword: value
        },
        success: res => {},
        fail: error => {
          // 调用失败函数
          _this.showModalError('网络不给力，请检查网络设置')
        }
      })
    }
  },

  /**
   * 错误提示
   */
  showModalError: function(message) {
    Taro.showModal({
      title: '错误提示',
      content: message,
      showCancel: false
    })
  },

  /**
   * 点击分类进来的搜索
   */
  categorySearch: function() {
    const value = this.data.inputVal
    let postObj = this.data.postObj
    postObj.keyword = value
    const categoryText = this.data.categoryText

    util.printLog('wechat_app', 'go_to_category', categoryText)

    this.setData({
      postObj: postObj,
      page: 0,
      shopData: []
    })
    this.getData(this.dataToTab)
  },

  /**
   * 获取数据，有参数的表示需要重新设定筛选tab
   */
  getData: function(func, shareFirstR) {
    const that = this
    let page = ++this.data.page

    // 把post对象复制
    const data = this.return_postObj(this.data.postObj)

    data.page = page

    util.request({
      url: constant.default.getProductList + '?keyword=' + data.keyword,
      method: 'POST',
      data: data,
      hasToken: false,
      success: function(res) {
        if (res.count == res.total) {
          setTimeout(function() {
            that.setData({
              isLoading: 'nomore'
            })
          }, 500)
        } else {
          that.setData({
            isLoading: 'loading'
          })
        }

        Taro.stopPullDownRefresh()
        if (func) {
          func(res.results.filters, res.total)
          // 第一次搜索，（ "if (func)" 把下拉刷新,上拉加载排除）
          if (res.total > 0) {
            wx.globalData.gio('setEvar', {
              searchWordLast_evar: data.keyword
            })
          }
        }

        if (shareFirstR) {
        } else {
          that.getProductsSellStatus(res.results.products)
          that.send_search_data_GIO(res.total)
        }
        // that.dataToShopList(res.results.products);
      }
    })
  },

  /**
   * 处理后台数据给Tab
   */
  dataToTab: function(filters, productLength) {
    //分配titleName是为筛选时，选择选项并post给后台做准备
    let tab = {
      proAndSer: [
        {
          name: '活动',
          titleName: 'promotions',
          values: []
        },
        {
          name: '服务',
          titleName: 'service',
          values: []
        }
      ],
      filters: [],
      tabShow: '', // 显示的tab下拉panel
      arrangeType: 0, // 显示的顺序默认为综合排序
      other: [],
      price: {
        min: '',
        max: ''
      }
    }

    let brands = {
      name: '品牌',
      titleName: 'brands',
      values: filters.brand_info
    }
    let categories = {
      name: '分类',
      titleName: 'categories',
      values: filters.categories
    }

    let hasTab = false
    if (productLength != 0) {
      hasTab = true
    }
    this.setData({
      hasTab
    })

    //因为品牌和分类要放到筛选的panel里，所以把他们都push到filters里，方便显示和选择、取消小标签功能
    tab.filters.push(brands, categories, ...filters.filters)
    tab.proAndSer[0].values = filters.promotions
    tab.proAndSer[1].values = filters.service

    this.initChooseData(tab, filters.smart_tag.name)
  },

  /**
   * 把选项初始化成未选择状态（如brand:["YSL"]变为 brand"[{text:"YSL", isChoose:false}]）
   */
  initChooseData: function(tab, smartTag) {
    for (let k in tab) {
      for (let i = 0; i < tab[k].length; i++) {
        if (tab[k][i].values.length < 4) {
          tab[k][i].showHideType = 0 //0表示不需要隐藏,1表示需要隐藏，2表示隐藏的已经展开
        } else {
          tab[k][i].showHideType = 1
        }

        // 这个页面的品牌和购物车里的搜索引擎页面的品牌不一样，有id，筛选的时候传id（为了分享出去的url不报错，因为当品牌名字有&的时候，直接传品牌名字会报错）
        if (tab[k][i].name == '品牌') {
          for (let j = 0; j < tab[k][i].values.length; j++) {
            let obj = {}
            obj.text = tab[k][i].values[j].name
            obj.isChoose = false
            obj.id = tab[k][i].values[j].id
            tab[k][i].values[j] = obj
          }
        } else {
          for (let j = 0; j < tab[k][i].values.length; j++) {
            let obj = {}
            obj.text = tab[k][i].values[j]
            obj.isChoose = false
            tab[k][i].values[j] = obj
          }
        }
      }
    }

    //智能标签只能是品牌或者分类，需要在这里才赋值，否则数据结构会出现错误
    for (let i = 0; i < tab.filters.length; i++) {
      if (
        tab.filters[i].titleName == smartTag ||
        tab.filters[i].name == smartTag
      ) {
        // 把被标为smart标签的赋值给other数组，并把被标为smart标签的数组从filters里删除
        tab.other[0] = tab.filters[i]
        tab.filters.splice(i, 1)
      }
    }

    let tabShow = {}
    tabShow.arrange = {}
    tabShow.arrange.arrange = '排序'
    tabShow.arrange.showName = '综合排序'

    if (tab.other[0] && tab.other[0].values.length > 0) {
      tabShow.other = {}
      tabShow.other.name = tab.other[0].name || tab.other[0].titleName
      tabShow.other.showName = tab.other[0].name || tab.other[0].titleName
    }

    tabShow.proAndSer = {}
    tabShow.proAndSer.name = '活动'
    tabShow.proAndSer.showName = '活动'

    tabShow.filters = {}
    tabShow.filters.name = '筛选'
    tabShow.filters.showName = '筛选'

    this.setData({
      tab: tab,
      tabShow
    })

    this.initTabDataFromShare()
  },

  /**
   * 初始化从别人分享的小程序中进来本页，所带上的已经筛好的tab信息
   */
  initTabDataFromShare: function() {
    if (this.data.fromShareData) {
      this.shareDataTurnTab()
    }
  },

  /**
   * 把postObj转成tab数据（初始化完就删掉，为了防止再次初始化）
   */
  shareDataTurnTab: function() {
    let tab = this.data.tab
    let postObj = this.data.fromShareData
    let tabShow = this.data.tabShow

    // 排序
    if (postObj.sort.created_time == 'desc') {
      tab.arrangeType = 1
      tabShow.arrange.showName = '最近上架'
    } else if (postObj.sort.retail_price) {
      tab.arrangeType = 2
      tabShow.arrange.showName = '价格低到高'
      if (postObj.sort.retail_price == 'desc') {
        tab.arrangeType = 3
        tabShow.arrange.showName = '价格高到低'
      }
    } else {
      tab.arrangeType = 0
      tabShow.arrange.showName = '综合排序'
    }

    if (postObj.filters) {
      // 价格
      if (postObj.filters.price) {
        const price = postObj.filters.price
        tab.price.min = price.min
        tab.price.max = price.max
      }

      // 不确定的筛选条件
      if (postObj.filters.filters) {
        const filters = postObj.filters.filters
        for (let i in filters) {
          for (let j = 0; j < tab.filters.length; j++) {
            if (tab.filters[j].id == i) {
              for (let k = 0; k < tab.filters[j].values.length; k++) {
                if (filters[i].indexOf(tab.filters[j].values[k].text) > -1) {
                  tab.filters[j].values[k].isChoose = true
                }
              }
            }
          }
          for (let j = 0; j < tab.other.length; j++) {
            if (tab.other[j].id == i) {
              for (let k = 0; k < tab.other[j].values.length; k++) {
                if (filters[i].indexOf(tab.other[j].values[k].text) > -1) {
                  tab.other[j].values[k].isChoose = true
                }
              }
            }
          }
        }
      }

      // 活动
      if (postObj.filters.promotions) {
        const promotion = postObj.filters.promotions

        for (let i = 0; i < tab.proAndSer[0].values.length; i++) {
          if (promotion.indexOf(tab.proAndSer[0].values[i].text) > -1) {
            tab.proAndSer[0].values[i].isChoose = true
          }
        }
      }

      // 类别
      if (postObj.filters.categories) {
        const categories = postObj.filters.categories

        // 因为categories 有可能在filters里 也有可能在 other里，所以俩for
        for (let i = 0; i < tab.filters.length; i++) {
          if (
            tab.filters[i].titleName &&
            tab.filters[i].titleName == 'categories'
          ) {
            for (let j = 0; j < tab.filters[i].values.length; j++) {
              if (categories.indexOf(tab.filters[i].values[j].text) > -1) {
                tab.filters[i].values[j].isChoose = true
              }
            }
          }
        }
        for (let i = 0; i < tab.other.length; i++) {
          if (
            tab.other[i].titleName &&
            tab.other[i].titleName == 'categories'
          ) {
            for (let j = 0; j < tab.other[i].values.length; j++) {
              if (categories.indexOf(tab.other[i].values[j].text) > -1) {
                tab.other[i].values[j].isChoose = true
              }
            }
          }
        }
      }

      // 品牌
      if (postObj.filters.brand_id) {
        const brand_id = postObj.filters.brand_id
        // 因为brands 有可能在filters里 也有可能在 other里，所以俩for
        for (let i = 0; i < tab.filters.length; i++) {
          if (
            tab.filters[i].titleName &&
            tab.filters[i].titleName == 'brands'
          ) {
            for (let j = 0; j < tab.filters[i].values.length; j++) {
              if (brand_id.indexOf(tab.filters[i].values[j].id) > -1) {
                tab.filters[i].values[j].isChoose = true
              }
            }
          }
        }
        for (let i = 0; i < tab.other.length; i++) {
          if (tab.other[i].titleName && tab.other[i].titleName == 'brands') {
            for (let j = 0; j < tab.other[i].values.length; j++) {
              if (brand_id.indexOf(tab.other[i].values[j].id) > -1) {
                tab.other[i].values[j].isChoose = true
              }
            }
          }
        }
      }
    }

    const _this = this

    this.setData(
      {
        tab,
        tabShow
      },
      function() {
        delete _this.data.fromShareData
        // 这里可以再优化（因为有已经存在postObj数据了，就可以不用从tab组织postObj数据了，但是这里为了尽快上线，直接复用confirmChoose的方法）

        _this.confirmChoose()
      }
    )
  },

  /**
   * 给数据加上库存状态
   */
  getProductsSellStatus: function(data) {
    const allIds = this.getProductmainIds(data)
    const _this = this

    util.request({
      url: constant.default.getProductsSellStatus,
      method: 'POST',
      hasToken: false,
      data: {
        // "id_list": allIds
        productmain_ids: allIds
      },
      success: function(res) {
        const onSellProductsIds = _this.getOnSellProductsIds(res.results)
        _this.dataToShopList(data, onSellProductsIds)
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
   * 获取所有产品的productmain_id
   */
  getProductmainIds: function(data) {
    let allIds = []

    allIds = data.map(function(product) {
      return product.productmain_id
    })

    return allIds
  },

  /**
   * 处理后台数据给shopList
   */
  dataToShopList: function(data, onSellIds) {
    let shopData = this.data.shopData
    let product_data_GIO = this.product_data_GIO

    for (let i = 0; i < data.length; i++) {
      const product = data[i]
      let shopObj = {}

      shopObj.originalPrice = product.original_price
      shopObj.retailPrice = product.display_price
      shopObj.title = product.brand + ' ' + product.name
      shopObj.id = product.id
      shopObj.sellOut = false
      let image = product.image
      if (util.needPrecssImage(image)) {
        image = product.image + constant.default.imageSuffix.squareM
      }
      shopObj.img = image

      product_data_GIO[product.id] = this.handle_product_data_GIO(product)

      // 加上库存状态
      if (onSellIds.indexOf(product.productmain_id) < 0) {
        shopObj.sellOut = true
      }

      shopObj.activeArr = product.promotion_names

      shopData.push(shopObj)
    }

    this.setData({
      shopData: shopData
    })
  },

  /**
   * 输入价格区间
   */
  inputPrice: function(e) {
    const tab = this.data.tab

    if (e.target.dataset.price == 'min') {
      tab.price.min = parseInt(e.detail.value)
    } else {
      tab.price.max = parseInt(e.detail.value)
    }

    this.setData({
      tab: tab
    })
  },

  /**
   * 点击选择了筛选内容后，标签颜色变化(对应数据中的isChoose改为true)
   */
  chooseSpan: function(e) {
    const name = e.target.dataset.name
    const dataIndex = e.target.dataset.index
    const tabShow = this.data.tab.tabShow
    const tab = this.data.tab
    const data = tab[tabShow]

    for (let i = 0; i < data.length; i++) {
      if (data[i].name == name) {
        data[i].values[dataIndex].isChoose = !data[i].values[dataIndex].isChoose
      }
    }
    this.setData({
      tab: tab
    })
  },

  /**
   * 重置选项
   */
  resetChoose: function() {
    const tab = this.data.tab
    const tabShow = this.data.tabShow
    const str = this.data.tab.tabShow //正在打开的tab

    for (let i = 0; i < tab[str].length; i++) {
      for (let j = 0; j < tab[str][i].values.length; j++) {
        tab[str][i].values[j].isChoose = false
      }
    }

    if (str == 'filters') {
      // 把价格区间也归零
      tab.price.min = ''
      tab.price.max = ''
    }

    tabShow[str].showName = tabShow[str].name

    this.setData({
      tab: tab
    })

    this.confirmChoose()
  },

  /**
   * 点击任何一种排序
   */
  chooseArrange: function(e) {
    const tab = this.data.tab
    const tabShow = this.data.tabShow

    tab.arrangeType = e.target.dataset.type
    tab.tabShow = ''
    tabShow.arrange.showName = e.target.dataset.text

    this.set_filter_arrange_data_GIO('排序', tabShow.arrange.showName)

    this.setData({
      tab,
      tabShow
    })

    this.confirmChoose()
  },

  /**
   * 提交筛选条件
   */
  confirmChoose: function() {
    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    const that = this
    const tab = this.data.tab
    this.click_filter_other_GIO = []

    let data = {
      keyword: this.data.postObj.keyword,
      filters: {
        filters: {}
      },
      sort: {},
      page: 1
    }

    // 整理排序tab的数据
    switch (tab.arrangeType) {
      case 0:
        data.sort = {
          default: ''
        }
        break

      case 1:
        data.sort = {
          created_time: 'desc'
        }
        break

      case 2:
        data.sort = {
          retail_price: 'asc'
        }
        break

      case 3:
        data.sort = {
          retail_price: 'desc'
        }
        break
    }

    // 整理各种tab选项的数据（不用整理tab.other，因为filters中的一项和tab.other指向同一个地址）
    // 本来不需要整理tab.other，但是因为returnChoose里添加了一个功能（tab标签下，有筛选条件被选中，那么该tab标签的showName和name不一样，在页面体现出来的就是颜色变红），所以需要整理tab.other
    this.returnChoose(data.filters, tab.proAndSer, 'proAndSer')
    this.returnChoose(data.filters, tab.filters, 'filters')
    if (tab.other) {
      // 如果有smartag标签
      this.returnChoose(data.filters, tab.other, 'other')
    }
    // 整理价格的数据
    // if(tab.price.max < tab.price.min) {

    //   const temp = tab.price.min;

    //   tab.price.min = tab.price.max;
    //   tab.price.max = temp;
    // }

    data.filters.price = tab.price

    // 只要筛选里有价格变动，或者点击了筛选里的小标签，tab里的筛选字变红色（与前几个不一样），所以直接showName等于price就行
    if (tab.price.min) {
      this.data.tabShow.filters.showName = 'price'
      this.set_filter_other_data_GIO('最低价', tab.price.min)
    }

    if (tab.price.max) {
      this.data.tabShow.filters.showName = 'price'
      this.set_filter_other_data_GIO('最高价', tab.price.max)
    }

    // 如果是点击分类进入的搜索页面，并且没有选择筛选里的分类，那么在post的数据里添加上分类
    if (this.data.categoryText && !data.filters.categories) {
      data.filters.categories = []
      data.filters.categories.push(this.data.categoryText)
    }
    data = this.return_postObj(data)

    this.setData({
      page: 1,
      shopData: [],
      postObj: data,
      isLoading: 'loading',
      tabShow: this.data.tabShow
    })

    util.request({
      url: constant.default.getProductList + '?keyword=' + data.keyword, //这里还要不要keyword
      method: 'POST',
      hasToken: false,
      data: data,
      success: function(res) {
        const tab_ = that.data.tab
        let loadText = ''

        if (res.count == res.total) {
          loadText = 'nomore'
        }

        tab_.tabShow = '.'
        tab_.price = tab.price
        that.setData({
          tab: tab_,
          isLoading: loadText
        })
        that.getProductsSellStatus(res.results.products)
        Taro.hideToast()

        that.send_search_data_GIO(res.total)
      }
    })

    this.send_filter_data_GIO()
  },

  /**
   * 挑选出已选择的选项组成相应的格式。传入array格式为[{ name: '活动', titleName: 'promotions', values: []}，...]
   */
  returnChoose: function(data, arr, str) {
    let tabShow = this.data.tabShow
    let showName = ''

    // 修改arr，就是直接修改this.data.tab对象里的内容
    for (let i = 0; i < arr.length; i++) {
      let values = []

      for (let j = 0; j < arr[i].values.length; j++) {
        const item = arr[i].values[j]

        if (item.isChoose == true) {
          if (arr[i].name == '品牌') {
            values.push(item.id)
            data['brand_id'] = values
            showName += item.text + ','
          } else {
            values.push(item.text)

            if (arr[i].titleName) {
              //一般固定的分类如：brand，categories，service，promotions，这类有设定的titleName

              data[arr[i].titleName] = values

              showName += item.text + ','
            } else {
              //筛选中不固定的分类，
              data.filters[arr[i].id] = values
              showName += item.text + ','
            }
          }

          this.set_filter_other_data_GIO(arr[i].name, item.text)
        }
      }
    }

    if (showName) {
      showName = showName.substr(0, showName.length - 1)
      tabShow[str].showName = showName
      this.setData({
        showName
      })
    } else {
      if (arr.length > 0 && tabShow[str]) {
        // 如果没有smarttag，那么这里不能赋值
        tabShow[str].showName = tabShow[str].name
      }
    }
  },

  /**
   * 点击查看商品详情
   */
  linkToProductInfo: function(e) {
    const id = e.currentTarget.dataset.id
    const inputVal = this.data.inputVal || ' '
    const value = inputVal + '~=' + id
    util.printLog('wechat_app', 'searchAndClick', value)

    this.product_send_GIO(id)

    Taro.navigateTo({
      url: '../../product/detail/detail?id=' + id
    })
  },

  /**
   * 判断是否有shop_num，如果有则在filter上加上shop_num
   */
  return_postObj: function(postObj = {}) {
    if (this.shop_num == null) {
      return postObj
    } else {
      if (postObj.filters) {
        postObj.filters.shop_num = this.shop_num
      } else {
        postObj.filters = {}
        postObj.filters.shop_num = this.shop_num
      }
      return postObj
    }
  },

  ////////////////////////////////////////////以下是可复用内容（GIO部分，list.js和attendActivity.js都有，等把品牌详情添加GIO埋点后一起处理，优化）

  /**
   * 发送搜索数据给GIO
   */
  send_search_data_GIO: function(length) {
    const searchKeywords_var = this.data.postObj.keyword
    const searchSource_var = this.search_source_GIO
    const searchType_var = this.search_type_GIO
    const searchResults_var = length > 0 ? true : false

    const obj = {
      searchKeywords_var,
      searchSource_var,
      searchType_var,
      searchResults_var
    }

    GIO_utils.send_track_function('searchSuccess', obj)
  },

  /**
   * 组建product数据给GIO
   */
  handle_product_data_GIO: function(product) {
    let product_GIO = {}
    product_GIO.searchKeywords_var = this.data.postObj.keyword
    product_GIO.searchType_var = this.search_type_GIO
    product_GIO.searchSource_var = this.search_source_GIO
    product_GIO.productId_var = product.id
    product_GIO.productMainName_var = product.brand + ' ' + product.name
    product_GIO.brandName_var = product.brand
    product_GIO.productSkuAttr_var = product.sku_attr
    product_GIO.skuDep_var = product.shop_name
    product_GIO.skuFloor_var = product.floor_name
    product_GIO.campaignName_var = product.promotion_titles.join('|')
    product_GIO.campaignType_var = product.promotion_names.join('|')
    product_GIO.listIndex_var = this.data.shopData.length

    return product_GIO
  },

  /**
   * 点击商品发送信息给GIO
   */
  product_send_GIO: function(product_id) {
    const product_GIO = this.product_data_GIO[product_id]
    GIO_utils.send_track_function('searchResultClick', product_GIO)
  },

  /**
   * 设置其他数据
   */
  set_filter_other_data_GIO: function(filterType_var, filterContent_var) {
    const obj = { filterType_var, filterContent_var }
    this.click_filter_other_GIO.push(obj)
  },

  /**
   * 设置排序数据
   */
  set_filter_arrange_data_GIO: function(filterType_var, filterContent_var) {
    this.click_filter_arrange_GIO = {
      filterType_var,
      filterContent_var,
      searchSource_var: this.search_source_GIO
    }
  },

  /**
   * 发送筛选数据给GIO
   */
  send_filter_data_GIO: function() {
    const { click_filter_other_GIO } = this
    const _this = this

    click_filter_other_GIO.forEach(item => {
      item.searchSource_var = _this.search_source_GIO

      GIO_utils.send_track_function('filterClick', item)
    })

    if (this.click_filter_arrange_GIO.filterType_var) {
      GIO_utils.send_track_function(
        'filterClick',
        this.click_filter_arrange_GIO
      )
      this.click_filter_arrange_GIO = {}
    }
  }
}

const assignedObject = util.assignObject(
  pageData,
  chooseFeature,
  chooseSpan,
  returnTop,
  returnToHome
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '商品列表'
  }

  render() {
    const {
      inputVal: inputVal,
      inputShowed: inputShowed,
      shopShow: shopShow,
      tab: tab,
      tabShow: tabShow,
      canShare: canShare,
      hasTab: hasTab,
      shopData: shopData,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome,
      isLoading: isLoading
    } = this.state
    return (
      <View
        className="page"
        id="product-detail-top"
        style="background-color:transparent;"
      >
        {/* <template name="searchBarHeader" > */}
        <View className="page__bd">
          <View className="weui-search-bar">
            <View className="weui-search-bar__form">
              <View className="weui-search-bar__box list-page">
                <Icon
                  className="weui-icon-search_in-box"
                  type="search"
                  size="14"
                ></Icon>
                <Input
                  type="text"
                  className="weui-search-bar__input"
                  placeholder="搜索"
                  value={inputVal}
                  focus={inputShowed}
                  onInput={this.inputTyping}
                  onConfirm={this.outSearchSend}
                  confirmType="search"
                ></Input>
                {inputVal.length > 0 && (
                  <View className="weui-icon-clear" onClick={this.clearInput}>
                    <Icon type="clear" size="14"></Icon>
                  </View>
                )}
              </View>
              {/*  <label class="weui-search-bar__label" hidden="{{inputShowed}}" bindtap="showInput">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <icon class="weui-icon-search" type="search" size="14"></icon>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      <view class="weui-search-bar__text">搜索</view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </label>  */}
            </View>
            {/* <view class="weui-search-bar__cancel-btn" hidden="{{!inputShowed}}" bindtap="hideInput">取消</view> */}
            <View className="list-icon" onClick={this.showType}>
              {shopShow == true && (
                <I className="sparrow-icon icon-list-show2"></I>
              )}
              {shopShow == false && (
                <I className="sparrow-icon icon-list-show1"></I>
              )}
            </View>
          </View>
        </View>
        {/* </template> */}
        {/* 导航条 */}
        {hasTab && (
          <Block>
            <View className="page_tab">
              <View className="tab">
                <View
                  className={
                    'nav-bar ' +
                    (tab.tabShow == 'arrange' ? 'current-tab' : '') +
                    '  ' +
                    (tabShow.arrange.name == tabShow.arrange.showName
                      ? ''
                      : 'choose-tab')
                  }
                  data-hi="arrange"
                  onClick={this.showTab}
                >
                  {tabShow.arrange.showName}
                </View>
                {tab.other[0].values.length > 0 && (
                  <View
                    className={
                      'nav-bar ' +
                      (tab.tabShow == 'other' ? 'current-tab' : '') +
                      '  ' +
                      (tabShow.other.name == tabShow.other.showName
                        ? ''
                        : 'choose-tab')
                    }
                    data-hi="other"
                    onClick={this.showTab}
                  >
                    {tabShow.other.showName}
                  </View>
                )}
                {(tab.proAndSer[0].values.length > 0 ||
                  tab.proAndSer[1].values.length > 0) && (
                  <View
                    className={
                      'nav-bar ' +
                      (tab.tabShow == 'proAndSer' ? 'current-tab' : '') +
                      '  ' +
                      (tabShow.proAndSer.name == tabShow.proAndSer.showName
                        ? ''
                        : 'choose-tab')
                    }
                    data-hi="proAndSer"
                    onClick={this.showTab}
                  >
                    {tabShow.proAndSer.showName}
                  </View>
                )}
                <View
                  className={
                    'nav-bar ' +
                    (tab.tabShow == 'filters' ? 'current-tab' : '') +
                    '  ' +
                    (tabShow.filters.name == tabShow.filters.showName
                      ? ''
                      : 'choose-tab')
                  }
                  data-hi="filters"
                  onClick={this.showTab}
                >
                  筛选
                </View>
              </View>
              {/* tab排序 */}
              {tab.tabShow == 'arrange' && (
                <Block>
                  <View className="tab-panel">
                    <View className="arrange-panel">
                      <View className="weui-flex">
                        <View className="weui-flex__item">
                          <View
                            className={
                              'arrange-span ' +
                              (tab.arrangeType == 0 ? 'arrange-red' : '')
                            }
                            data-type={0}
                            data-text="综合排序"
                            onClick={this.chooseArrange}
                          >
                            综合排序
                          </View>
                        </View>
                        <View className="weui-flex__item">
                          <View
                            className={
                              'arrange-span ' +
                              (tab.arrangeType == 1 ? 'arrange-red' : '')
                            }
                            data-type={1}
                            data-text="最新上架"
                            onClick={this.chooseArrange}
                          >
                            最新上架
                          </View>
                        </View>
                        <View className="weui-flex__item">
                          <View
                            className={
                              'arrange-span ' +
                              (tab.arrangeType == 2 ? 'arrange-red' : '')
                            }
                            data-type={2}
                            data-text="价格低到高"
                            onClick={this.chooseArrange}
                          >
                            价格低到高
                          </View>
                        </View>
                        <View className="weui-flex__item">
                          <View
                            className={
                              'arrange-span ' +
                              (tab.arrangeType == 3 ? 'arrange-red' : '')
                            }
                            data-type={3}
                            data-text="价格高到低"
                            onClick={this.chooseArrange}
                          >
                            价格高到低
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </Block>
              )}
              {/* tab */}
              {tab.tabShow == 'other' && (
                <Block>
                  <ChooseFeatureTmpl
                    data={{
                      arr: (tab.other, canShare)
                    }}
                  ></ChooseFeatureTmpl>
                </Block>
              )}
              {/* tab活动服务  */}
              {tab.tabShow == 'proAndSer' && (
                <Block>
                  <ChooseFeatureTmpl
                    data={{
                      arr: (tab.proAndSer, canShare)
                    }}
                  ></ChooseFeatureTmpl>
                </Block>
              )}
              {/* tab筛选 */}
              {tab.tabShow == 'filters' && (
                <Block>
                  <View className="filter-div">
                    <View className="price-field">
                      <View className="price-field-word">价格区间（元）</View>
                      <View className="price-field-input-div">
                        <Input
                          placeholder="最低价"
                          onInput={this.inputPrice}
                          className="price-field-input"
                          type="number"
                          data-price="min"
                          value={tab.price.min}
                        ></Input>
                        <Span>—</Span>
                        <Input
                          placeholder="最高价"
                          onInput={this.inputPrice}
                          className="price-field-input"
                          type="number"
                          data-price="max"
                          value={tab.price.max}
                        ></Input>
                      </View>
                    </View>
                    <ChooseFeatureTmpl
                      data={{
                        arr: (tab.filters, canShare)
                      }}
                    ></ChooseFeatureTmpl>
                  </View>
                </Block>
              )}
            </View>
          </Block>
        )}
        {/* 选择各种筛选条件时出现的蒙版 */}
        {(tab.tabShow == 'arrange' ||
          tab.tabShow == 'other' ||
          tab.tabShow == 'proAndSer' ||
          tab.tabShow == 'filters') && (
          <Block>
            <View className="tab-mask-in" onClick={this.hideTab}></View>
          </Block>
        )}
        {/* 搜索栏出现的蒙版 */}
        {/* <block wx:if="{{inputShowed==true}}">
                                                                                                                                                                                                                                                                                                               <view class="search-mask-in" bindtap="hideInput"></view>
                                                                                                                                                                                                                                                                                                             </block> */}
        {/* shop列表展示方式1 */}
        {shopShow == true && (
          <Block>
            <View className="shopItem1-out">
              {shopData.map((item, idx) => {
                return (
                  <Block key="*this">
                    <ShopItemaTmpl data={item}></ShopItemaTmpl>
                  </Block>
                )
              })}
            </View>
          </Block>
        )}
        {/* shop列表展示方式2 */}
        {shopShow == false && (
          <Block>
            <View>
              {shopData.map((item, idx) => {
                return (
                  <Block key="*this">
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
          </Block>
        )}
        <ReturnTopTmpl data={showReturnTop}></ReturnTopTmpl>
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
      </View>
    )
  }
}

export default _C
