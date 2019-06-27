import Taro from '@tarojs/taro'

import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import chooseFeature from '../../../component/chooseFeature/chooseFeature.js'
import chooseSpan from '../../../component/chooseSpan/chooseSpan.js'
// import promotionInfo from '../../../component/promotionInfo/promotionInfo';
import GIO_utils from '../../../utils/GIO_utils.js'

const attendActivity = {
  /**
   * 页面的初始数据
   */
  data: {
    tab: {},
    shopShow: true, // 列表显示
    inputShowed: false, // 搜索栏
    inputVal: '', // 搜索栏上填写的数据
    // searchVal: "口红",// 正在搜索的关键词
    shopData: [], // 传给模板的商品数据
    page: 0, // 当前商品页面（分页获取）
    promotionName: '', // 活动类型
    postObj: {
      keyword: '', // 初始的搜索字
      page: 0,
      sort: {
        default: ''
      },
      filters: {
        promotionmain_ids: [0],
        is_main_sku: false // 这里要返回单品列表而不是商品列表，否则直接添加购物车按钮点击会出错
      }
    },
    isLoading: 'loading', // 页面底部显示loading或者没有更多了
    hasTab: false, // 不显示导航栏
    // promotions: {}, // 活动英文名和中文对应对象
    showGiftPopup: false, // 是否显示选择赠品，加价购商品，优惠券弹框
    timer: {}, //定时器
    tabShow: {} // 导航栏显示的内容
  },

  product_GIO: {}, // 商品对应的GIO数据
  search_source_GIO: '购物车活动',
  search_type_GIO: '购物车凑单页',
  click_filter_other_GIO: [],
  click_filter_arrange_GIO: {},
  product_data_GIO: {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.closeTimer() //关掉查看活动详情里的定时器
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
    this.hideInput()
  },
  inputTyping: function(e) {
    const postObj = {
      keyword: '',
      page: 0,
      sort: {
        default: ''
      },
      filters: {
        promotionmain_ids: [0],
        is_main_sku: false
      }
    }
    const promotionId = this.data.promotionId
    postObj.filters.promotionmain_ids = [promotionId]

    this.setData({
      postObj,
      inputVal: e.detail.value
    })
  },
  searchSend: function() {
    const value = this.data.inputVal
    let postObj = this.data.postObj
    postObj.keyword = value

    this.setData({
      postObj: postObj,
      page: 0,
      shopData: []
    })
    this.getData(this.dataToTab)
  },

  /**
   * 获取promotionId,有func就是代表从点击活动进来，没有代表下拉刷新
   */
  getPromotionId: function(promotionId, func) {
    if (func) {
      this.data.postObj = {
        keyword: '',
        page: 0,
        sort: {
          default: ''
        },
        filters: {
          promotionmain_ids: [promotionId],
          is_main_sku: false
        }
      }
      this.getData(this.dataToTab)
    } else {
      this.getData()
    }

    if (this.data.fixedpriceAndGift[promotionId].meet_promotion) {
      if (this.data.fixedpriceAndGift[promotionId].type == 'GIFT') {
        this.setGiftPopup1(promotionId)
      } else if (
        this.data.fixedpriceAndGift[promotionId].type == 'FIXED_PRICE'
      ) {
        this.setGiftPopup1(promotionId)
        this.setData({
          showGiftPopup: true
        })
        util.printLog('wechat_app', 'choose_fixedprice', '')
      } else if (this.data.fixedpriceAndGift[promotionId].type == 'COUPON') {
        this.setGiftPopup2(promotionId)
        this.setData({
          showGiftPopup: true
        })
      }
    }
  },

  /**
   * 组织赠品/换购产品的弹框的数据并显示
   */
  setGiftPopup1(id) {
    const gifts = this.data.fixedpriceAndGift[id].gifts
    const seletedGifts = this.data.fixedpriceAndGift[id].selectedGifts

    let proGiftArr = {}
    proGiftArr.promotion_type = this.data.fixedpriceAndGift[id].type

    if (seletedGifts) {
      // 避免没有selectedGifts的时候报错
      proGiftArr.chosenNum = seletedGifts.length
    }

    if (gifts) {
      for (let i = 0; i < gifts.length; i++) {
        gifts[i].checked = false
        gifts[i].chooseGift = true
        for (let j = 0; j < seletedGifts.length; j++) {
          if (gifts[i].id == seletedGifts[j].id) {
            gifts[i].checked = true
          }
        }
      }
    }

    proGiftArr.giftArr = gifts

    this.setData({
      proGiftArr
      // showGiftPopup: true,
    })
  },

  /**
   * 组织优惠券产品的弹框数据并显示
   */
  setGiftPopup2(id) {
    let proGiftArr = {}
    proGiftArr.promotion_type = this.data.fixedpriceAndGift[id].type
    proGiftArr.giftArr = this.data.fixedpriceAndGift[id].coupons
    this.setData({
      proGiftArr,
      showGiftPopup: true
    })
  },

  /**
   * 隐藏赠品/换购产品的弹框
   */
  hideGiftPopup() {
    this.setData({
      showGiftPopup: false
    })
  },

  /**
   * 显示赠品/换购产品的弹框
   */
  showGiftPopup() {
    this.setData({
      showGiftPopup: true
    })

    const promotionId = this.data.promotionId
    const fixedpriceAndGift = this.data.fixedpriceAndGift
    if (fixedpriceAndGift[promotionId].type == 'GIFT') {
      util.printLog('wechat_app', 'choose_gift', '')
    } else if (fixedpriceAndGift[promotionId].type == 'FIXED_PRICE') {
      util.printLog('wechat_app', 'choose_fixedprice', '')
    }
  },

  /**
   * 获取数据
   */
  getData: function(func) {
    const that = this
    let page = ++this.data.page

    // 把post对象复制
    // const data = lodash.clone(this.data.postObj);
    const data = this.data.postObj
    data.page = page

    util.request({
      url: constant.getBrandProductsList2 + '?keyword=' + data.keyword,
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
        that.getProductsSellStatus(res.results.products)
        that.send_search_data_GIO(res.total)
      }
    })
  },

  /**
   * 处理后台数据给Tab
   */
  dataToTab: function(filters, productLength) {
    // 分配titleName是为筛选时，选择选项并post给后台做准备
    // 凑单页面因为不需要那么精细和搜索引擎不一样，所以不用proAndSer
    let tab = {
      // proAndSer: [
      // { name: '活动', titleName: 'promotions', values: [] },
      // { name: '服务', titleName: 'service', values: [] }],
      filters: [],
      tabShow: '', // 显示的tab下拉panel
      arrangeType: 0, // 显示的顺序默认为综合排序
      other: [],
      price: { min: '', max: '' }
    }

    let brands = { name: '品牌', titleName: 'brands', values: filters.brands }
    let categories = {
      name: '分类',
      titleName: 'categories',
      values: filters.categories
    }
    // let promotions = {};

    let hasTab = false
    if (productLength != 0) {
      hasTab = true
    }
    this.setData({
      hasTab
    })

    //因为品牌和分类要放到筛选的panel里，所以把他们都push到filters里，方便显示和选择、取消小标签功能
    tab.filters.push(brands, categories, ...filters.filters)
    // tab.proAndSer[0].values = filters.promotions;
    // tab.proAndSer[1].values = filters.service;

    // for (let i = 0; i < filters.promotion_names.length; i++) {
    //   const item = filters.promotion_names[i];
    //   promotions[item.type] = item.name;
    // }
    // this.setData({
    //   promotions
    // });

    this.initChooseData(tab, filters.smart_tag.name)
  },

  /**
   * 把选项初始化成未选择状态（如brand:["YSL"]变为 brand"[{text:"YSL", isChoose:false}]）
   */
  initChooseData: function(tab, smartTag) {
    // console.log(smartTag);

    for (let k in tab) {
      for (let i = 0; i < tab[k].length; i++) {
        if (tab[k][i].values.length < 4) {
          tab[k][i].showHideType = 0 //0表示不需要隐藏,1表示需要隐藏，2表示隐藏的已经展开
        } else {
          tab[k][i].showHideType = 1
        }

        for (let j = 0; j < tab[k][i].values.length; j++) {
          let obj = {}
          obj.text = tab[k][i].values[j]
          obj.isChoose = false
          tab[k][i].values[j] = obj
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

    // tabShow.proAndSer = {};
    // tabShow.proAndSer.name = '活动服务';
    // tabShow.proAndSer.showName = '活动服务';

    tabShow.filters = {}
    tabShow.filters.name = '筛选'
    tabShow.filters.showName = '筛选'

    this.setData({
      tab: tab,
      tabShow
    })
  },

  /**
   * 给数据加上库存状态
   */
  getProductsSellStatus: function(data) {
    const allIds = this.getProductIds(data)
    const _this = this

    util.request({
      url: constant.getProductsSellStatus,
      method: 'POST',
      data: {
        // "id_list": allIds
        product_ids: allIds
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
   * 获取所有产品的id
   */
  getProductIds: function(data) {
    let allIds = []

    allIds = data.map(function(product) {
      return product.id
    })

    return allIds
  },

  /**
   * 处理后台数据给shopList
   */
  dataToShopList: function(data, onSellIds) {
    let shopData = this.data.shopData

    for (let i = 0; i < data.length; i++) {
      let shopObj = {}
      shopObj.img = data[i].image
      shopObj.originalPrice = data[i].original_price
      shopObj.retailPrice = data[i].display_price
      shopObj.title = data[i].brand + ' ' + data[i].name
      shopObj.id = data[i].id
      shopObj.activeArr = data[i].promotion_names
      shopObj.sellOut = false
      if (data[i].sku_attr) {
        shopObj.title = shopObj.title + ' ' + data[i].sku_attr
      }
      // 加上库存状态
      if (onSellIds.indexOf(data[i].id) < 0) {
        shopObj.sellOut = true
      }

      this.data_to_product_GIO(data[i])

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
    // const tab = lodash.clone(this.data.tab);
    const tab = this.data.tab
    this.click_filter_other_GIO = []

    let data = {
      keyword: this.data.postObj.keyword,
      filters: {
        filters: {},
        promotionmain_ids: [this.data.promotionId],
        is_main_sku: false
      },
      sort: {},
      page: 1
    }

    // 整理排序tab的数据
    switch (tab.arrangeType) {
      case 0:
        data.sort = { default: '' }
        break

      case 1:
        data.sort = { created_time: 'desc' }
        break

      case 2:
        data.sort = { retail_price: 'asc' }
        break

      case 3:
        data.sort = { retail_price: 'desc' }
        break
    }

    // 整理各种tab选项的数据（不用整理tab.other，因为filters中的一项和tab.other指向同一个地址）
    // 本来不需要整理tab.other，但是因为returnChoose里添加了一个功能（tab标签下，有筛选条件被选中，那么该tab标签的showName和name不一样，在页面体现出来的就是颜色变红），所以需要整理tab.other
    // this.returnChoose(data.filters, tab.proAndSer, 'proAndSer');
    this.returnChoose(data.filters, tab.filters, 'filters')
    if (tab.other) {
      // 如果有smartag标签
      this.returnChoose(data.filters, tab.other, 'other')
    }

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

    this.setData({
      page: 1,
      shopData: [],
      postObj: data,
      isLoading: 'loading',
      tabShow: this.data.tabShow
    })

    util.request({
      url: constant.getBrandProductsList2 + '?keyword=' + data.keyword, //这里还要不要keyword
      method: 'POST',
      data: data,
      hasToken: false,
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
        Taro.hideToast()
        that.getProductsSellStatus(res.results.products)
        // that.dataToShopList(res.results.products);
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
    for (let i = 0; i < arr.length; i++) {
      let values = []

      for (let j = 0; j < arr[i].values.length; j++) {
        const item = arr[i].values[j]

        if (item.isChoose == true) {
          values.push(item.text)

          if (arr[i].titleName) {
            //一般固定的分类如：brand，categories，service，promotions，这类有设定的titleName
            data[arr[i].titleName] = values

            // if (arr[i].titleName == 'promotions') {
            //   showName += this.data.promotions[item.text] + ',';
            // } else {
            showName += item.text + ','
            // }
          } else {
            //筛选中不固定的分类，
            data.filters[arr[i].id] = values
            showName += item.text + ','
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
   * 点击返回购物车
   */
  returnToCart: function() {
    this.setData({
      showPromotion: false,
      showGiftPopup: false,
      page: 0,
      shopData: []
    })
    // this.getCart();
  },

  /**
   * 点击添加购物车
   */
  addToCart: function(e) {
    const _this = this
    const id = e.currentTarget.dataset.id
    const data = {
      product_id: id,
      quantity: 1
    }

    util.printLog('wechat_app', 'add_cart', id)

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.addProduct,
      data: data,
      method: 'POST',
      success: function(res) {
        _this.getCartData()

        let track_obj_GIO = _this.product_GIO[id]

        GIO_utils.send_track_function('addToCartSuccess', track_obj_GIO)
      }
    })
  },

  /**
   * 获取购物车数据
   */
  getCartData: function() {
    const _this = this
    util.request({
      url: constant.cart,
      method: 'GET',
      success: function(res) {
        const promotionId = _this.data.promotionId
        _this.initialData(res)

        if (
          _this.data.fixedpriceAndGift[promotionId].type == 'GIFT' ||
          _this.data.fixedpriceAndGift[promotionId].type == 'FIXED_PRICE'
        ) {
          _this.setGiftPopup1(promotionId)
        } else if (_this.data.fixedpriceAndGift[promotionId].type == 'COUPON') {
          _this.setGiftPopup2(promotionId)
        }

        Taro.showToast({
          icon: 'success',
          title: '添加成功'
        })
      }
    })
  },

  /**
   * 点击查看商品详情
   */
  linkToProductInfo: function(e) {
    const id = e.currentTarget.dataset.id

    this.product_send_GIO(id)

    Taro.navigateTo({
      url: '/packageA/product/detail/detail?id=' + id
    })
  },

  /**
   * 打钩选择赠品/加价购
   */
  chooseGift: function(e) {
    const giftIndex = e.currentTarget.dataset.index
    let proGiftArr = this.data.proGiftArr
    proGiftArr.giftArr[giftIndex].checked = !proGiftArr.giftArr[giftIndex]
      .checked

    proGiftArr.giftArr[giftIndex].checked
      ? proGiftArr.chosenNum++
      : proGiftArr.chosenNum--

    this.setData({
      proGiftArr
    })
  },

  /**
   * 选择完赠品和加价购之后点击确定按钮，向后台发送请求
   */
  postGift: function() {
    const seletedGift = this.data.proGiftArr
    const that = this
    let data = {}
    let url = ''
    let idStr = ''

    for (let i = 0; i < seletedGift.giftArr.length; i++) {
      if (seletedGift.giftArr[i].checked) {
        idStr += seletedGift.giftArr[i].id + ','
      }
    }
    idStr = idStr.substring(0, idStr.length - 1)

    if (seletedGift.promotion_type == 'GIFT') {
      if (!idStr) {
        this.setData({
          showGiftPopup: false
        })
        return
      }

      url = constant.chooseGift
      data = {
        gift_ids: idStr,
        promotionmain_id: this.data.promotionId
      }
    } else {
      url = constant.chooseFixedPrice
      data = {
        gift_product_ids: idStr,
        promotionmain_id: this.data.promotionId
      }
    }

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: url,
      data: data,
      method: 'POST',
      success: function(res) {
        that.setData({
          showGiftPopup: false,
          showPromotion: false
        })
        that.getCart()
      }
    })
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
   * 整理商品的GIO数据
   */
  data_to_product_GIO: function(product) {
    let product_GIO = {}

    product_GIO.productMainName_var = product.brand + ' ' + product.name
    product_GIO.productMainId_var = product.productmain_id || ''
    product_GIO.productId_var = product.id || ''
    product_GIO.brandId_var = product.brand_id || ''
    product_GIO.brandName_var = product.brand || ''
    product_GIO.productSkuAttr_var = product.sku_attr || ''
    product_GIO.originalPrice_var = product.original_price || ''
    product_GIO.retailPrice_var = product.retail_price || ''
    product_GIO.displayPrice_var = product.display_price || ''
    product_GIO.skuDep_var = product.shop_name || ''
    product_GIO.skuFloor_var = product.floor_name
    product_GIO.addToCartNumber_var = 1
    product_GIO.cartSource_var = '去凑单页'
    product_GIO.orderType_var = GIO_utils.return_order_type('online')
    product_GIO.campaignName_var = product.promotion_titles.join('|') || ''
    product_GIO.campaignType_var = product.promotion_names.join('|') || ''

    this.product_GIO[product.id] = product_GIO

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

export default attendActivity
