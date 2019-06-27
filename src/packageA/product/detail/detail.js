import {
  Block,
  View,
  Text,
  Image,
  RichText,
  ScrollView,
  Swiper,
  SwiperItem,
  Button,
  Input,
  Form
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../utils/util.js'
import qs from '../../../utils/qs/index.js'
import constant from '../../../config/constant.js'
import dialogService from '../../../component/dialog/dialogService.js'
import footerProduct from '../../../component/footer/product.js'

import swiper from './swiper/swiper.js'
// import activityConfig from './dialog/activity';
import selectConfig from './dialog/selectProduct.js'

import user from '../../../utils/user/index.js'
import promotionInfo from '../../../component/promotionInfo/promotionInfo.js'
import GIO_utils from '../../../utils/GIO_utils.js'

import CarouselfTmpl from '../../../imports/CarouselfTmpl.js'
import ScrollViewcMoreTmpl from '../../../imports/ScrollViewcMoreTmpl.js'
import ShopItembTmpl from '../../../imports/ShopItembTmpl.js'
import PromotionInfoTmpl from '../../../imports/PromotionInfoTmpl.js'
import PriceBoxTmpl from '../../../imports/PriceBoxTmpl.js'
import ProductTitleFullTmpl from '../../../imports/ProductTitleFullTmpl.js'
import DetailTitleTmpl from '../../../imports/DetailTitleTmpl.js'
import PropertyTmpl from '../../../imports/PropertyTmpl.js'
import BrandTmpl from '../../../imports/BrandTmpl.js'
import ActivityTmpl from '../../../imports/ActivityTmpl.js'
import './detail.scss'
const pageConfig = {
  /**
   * 页面的初始数据
   */
  data: {
    skuOptionsSelected: [],
    skuOptions: [],
    skus: [],
    optionIdArr: [],
    // sku 的 id
    id: -1,
    brandId: -1,
    isFlashsale: false, // 是不是闪购
    cartProductNum: 0, // 购物车数量
    tabIndex: 0, // 图文详情和商品参数的index，0是图文详情，1是商品参数
    showFixTab: false, // 控制吸顶的tab是否显示
    showReturnTop: false, // 控制是否显示回到顶部
    screenHeight: 1000, // 设备的高度

    // productPage: 1,
    // brandProducts: [],
    // isLoading: 'loading',
    currentSwiper: 0, // 当前滑块的index
    guessLikeflag: 0, // 推荐商品的逻辑是先拿到同类商品集合，如果同类商品已加载尽，那么加载同品牌的商品（0是同类，1是同品牌，2是全加载完了）
    guessLikePage: 1, // 猜你喜欢中的页数（不是准确的页数，而是当前品类商品页数或者当前品牌商品页数）
    brandProductData: [], // 同一品牌下的推荐商品集合
    brandProdTotalLength: 0, // 同一品牌下商品推荐数量
    recommendProduct: [], // 同类的商品集合（不排除同品牌）
    recommendTotalLength: 0, // 总共的推荐数量
    guessYouLikeArr: [], // 推荐商品瀑布流数据（先加载同类商品集合，如果加载完了同类商品，再加载同品牌的商品）
    categories: [],
    categoriesArr: [], // 整理后的categories数组
    isLoading: '',
    productInfoImage: [],
    R_BRAND: 'brand', // 同品牌推荐
    R_KIND: 'kind', // 同类型推荐
    R_GUESS: 'guess' // 猜你喜欢推荐
  },

  click_recommend_type_GIO: '', // 点击的推荐位类型
  brand_id_and_for_GIO: {}, // 同品牌推荐的商品和对应传给GIO的信息
  kind_id_and_for_GIO: {}, // 同类型推荐的商品和对应传给GIO的信息
  guess_id_and_for_GIO: {}, // 猜你喜欢的商品和对应传给GIO的信息

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

    console.log(this.route)

    const _this = this

    this.judgeTokenStatus()

    if (options.flashsale_id) {
      // 闪购商品详情
      const isFlashsale = true
      this.data.isFlashsale = isFlashsale // 先在这里赋值一次，为了onshow里给后台发送日志，setData神马的留到之后再一起来
      this.data.flashsale_id = options.flashsale_id
      this.data.id = options.id
      this.getProductData(
        constant.getFlashsaleProduct + options.flashsale_id + '/',
        isFlashsale
      )
    } else if (options.id) {
      // 普通商品
      const isFlashsale = false
      this.data.isFlashsale = isFlashsale
      this.data.id = options.id
      this.getProductData(constant.getProduct, isFlashsale)
    }

    this.getProductInfoImage()

    Taro.getSystemInfo({
      success: function(res) {
        _this.setData({
          screenHeight: res.windowHeight
        })
      }
    })
  },

  /**
   * 获取展示在图文详情里的图片
   */
  getProductInfoImage: function() {
    const _this = this
    util.request({
      url: constant.getProductInfoImage,
      hasToken: false,
      method: 'GET',
      success: function(res) {
        const productInfoImage = res.map(val => {
          let processImage = val
          if (util.needPrecssImage(processImage)) {
            processImage = processImage + constant.imageSuffix.productInfo
          }

          return processImage
        })

        _this.setData({
          productInfoImage
        })
      }
    })
  },

  /**
   * 获取数据
   */
  getProductData: function(url, isFlashsale) {
    let _this = this
    const newUrl = url + this.data.id + '/'

    let header = {}
    const userInfo = Taro.getStorageSync(constant.KEY_USER)
    header['Cache-Control'] = 'no-cache'

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    // 这里用wx.request而不用util.request是因为这个api报404错误的时候需要跳转到下架页面
    Taro.request({
      url: newUrl,
      header: header,
      method: 'GET',
      // dataType: obj.dataType,
      success: res => {
        // data	开发者服务器返回的数据
        // statusCode	开发者服务器返回的状态码
        // header	开发者服务器返回的 HTTP Response Header
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let data = res.data
          // 处理 204 不返回数据前端解析报错的问题
          if (res.statusCode === 204) {
            data = null
          }

          _this.handleProductData(newUrl, data.result, isFlashsale)
        } else {
          Taro.hideToast()
          // 错误分类处理
          if (res.statusCode >= 500) {
            _this.showModalError('服务器错误，请稍候重试')
          } else if (res.statusCode >= 400) {
            if (res.statusCode == 401) {
            } else if (res.statusCode == 404) {
              // 专门为了这个api添加的这行代码 404错误处理

              Taro.redirectTo({
                url: '/packageA/product/productClose/productClose'
              })
            } else {
              _this.showModalError(res.data.message)
              console.error('请求错误：' + res.statusCode)
              if (res.data.errors) {
                res.data.errors.forEach(errorObj => {
                  console.log(`${errorObj.field}: ${errorObj.message}`)
                })
              }
            }
          } else {
            _this.showModalError('其他错误，请稍后重试')
            console.error('其他错误：' + res.statusCode)
          }
        }
      },
      fail: error => {
        // 调用失败函数
        _this.showModalError('网络不给力，请检查网络设置')
      }
    })
  },

  /**
   * 处理product的数据
   */
  handleProductData: function(url, productData, isFlashsale) {
    // 取消下拉刷新
    let data = productData
    Taro.stopPullDownRefresh()
    // 设置阿里云oss图片
    data.description = data.description.map(val => {
      let processImage = val.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.productInfo
      }

      return processImage
    })

    data.title = data.brand.name + ' ' + data.title

    let processImage = data.brand.logo
    if (util.needPrecssImage(processImage)) {
      processImage = processImage + constant.imageSuffix.squareXS
    }

    // 设置线上数据 - productData
    this.data.brandId = data.brand.id
    this.setData({
      brandLogo: processImage,
      productData: data,
      brandId: data.brand.id,
      isFlashsale
    })

    // 设置 sku 数据
    this.initSkuOptionsData(data.products, data.sku_options)

    this.getBrandProductData('fromBrand')
    // data.categories = undefined;
    if (data.categories) {
      this.data.categories = data.categories
    }
    this.getRecommendProduct(this.data.categories, 'fromRecommend')
    this.getGuessYouLikeArr('fromRecommend')

    Taro.hideToast()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 设置sku数据
   */
  initSkuOptionsData: function(products, skuOptions) {
    // 这里的从sku数据结构是重写的，所以可能会与之前的数据结构有重合，冗余
    let optionsToFlag2DArr = [] // 当category有1个以上的时候，由行列组成的options2维数组，可以通过optionsToFlag2D[i][j]可以取到option的状态【0->不可点击，1->可点击，2->已经点击】。i表示第i个category，j表示1个category下第j个option
    let optionsToOptionId2DArr = [] // 当category有1个以上的时候，由行列组成的options2维数组，可以通过optionsToFlag2D[i][j]可以取到option的【optionId】。i表示第i个category，j表示1个category下第j个option
    let optionsNameObj = {} // 把选项optionId 和选项名字联系起来的对象
    let categoryNameArr = [] // 放着category名字,通过index获得，这里的index和optionsToFlag2DArr，optionsToOptionId2DArr的index通用。 optionsToFlag2D[i][j]的第一层index->i。
    let selectedOptionsArr = [] // 当前目前已经选择的options
    let checkOptionsArr = [] // 用来判断某一个option是否可以点击的数组，后面会有详细说明
    let optionsCategoryIndex = {} // 键：option的id，值：该option所在的category的index

    // 构建optionsToFlag2DArr，optionsToOptionId2DArr，optionsNameObj，categoryNameArr，
    for (let i = 0; i < skuOptions.length; i++) {
      const categoryItem = skuOptions[i]
      let optionsToFlagItem = []
      let optionsToOptionIdItem = []

      for (let j = 0; j < categoryItem.values.length; j++) {
        const optionItem = categoryItem.values[j]
        const optionNewId = categoryItem.id + '-' + optionItem.id
        optionsToFlagItem[j] = 0 // 所有选项一开始都是默认不可选
        optionsToOptionIdItem[j] = optionNewId
        optionsNameObj[optionNewId] = optionItem.value
        optionsCategoryIndex[optionNewId] = i
      }

      optionsToFlag2DArr[i] = optionsToFlagItem
      optionsToOptionId2DArr[i] = optionsToOptionIdItem
      categoryNameArr[i] = categoryItem.name // 这里一定得是i，因为需要index与上面俩对应
    }

    this.setData({
      // existProductObj,
      // existProductObjInfo,
      optionsToFlag2DArr,
      optionsToOptionId2DArr,
      optionsNameObj,
      categoryNameArr,
      selectedOptionsArr,
      checkOptionsArr,
      optionsCategoryIndex
    })
    this.getExistProductInfo(products, skuOptions)
    // this.initSelectedData(this.data.currentProduct.skus, skuOptions);
  },

  /**
   * 获得存在的单品数据（包括对应的sku_options）
   */
  getExistProductInfo: function(products, skuOptions) {
    let existProductObj = {} // 存在的商品（各种sku_options组合而成的单品，productId对应optionId）
    let existProductObjInfo = {} // 存在的商品信息（productId对应的product信息）

    let allProductsId = [] // 这个商品下的所有单品id（为了获取库存）

    for (let i = 0; i < products.length; i++) {
      let productObj = []

      allProductsId.push(products[i].id)

      for (let j = 0; j < products[i].skus.length; j++) {
        productObj.push(
          products[i].skus[j].id + '-' + products[i].skus[j].value_id
        )
      }

      existProductObj[products[i].id] = productObj
      existProductObjInfo[products[i].id] = products[i]
    }

    this.getProductsSellStatusAndInit(
      allProductsId,
      existProductObj,
      existProductObjInfo,
      skuOptions
    )
  },

  /**
   * 给数据加上库存状态，并设置好存在并且有库存的单品id，存在的不一定有库存的单品信息
   */
  getProductsSellStatusAndInit: function(
    allProductsId,
    existProductObj,
    existProductObjInfo,
    skuOptions
  ) {
    const _this = this
    const isFlashsale = this.data.isFlashsale
    let id = this.data.id
    let onSellProductsIds = []
    let newExistProductObj = {} // 在existProductObj里筛掉库存为0的单品后剩下来的可选单品
    let newExistProductLength = 0
    let data = {
      product_ids: allProductsId
    }
    let url = constant.getProductsSellStatus

    if (isFlashsale) {
      url = constant.getFlashsaleSellStatus
      data.flashsale_id = this.data.flashsale_id
    }

    util.request({
      url: url,
      method: 'POST',
      data: data,
      hasToken: false,
      success: function(res) {
        onSellProductsIds = _this.getOnSellProductsIdsFOrN(res.results)

        for (let i = 0; i < onSellProductsIds.length; i++) {
          const obj = existProductObj[onSellProductsIds[i]]
          newExistProductObj[onSellProductsIds[i]] = obj
          newExistProductLength++
        }

        // 设置当前产品数据 - currentProduct:因为存在默认单品无库存，但是其他单品有库存的情况，所以需要先获得existProductObj

        if (!newExistProductObj[id]) {
          // 默认product无库存

          for (let i in newExistProductObj) {
            // 随机找一个有库存的单品id为默认单品id
            id = i
            break
          }
        }

        _this.setData({
          id,
          existProductLength: newExistProductLength,
          existProductObj: newExistProductObj,
          existProductObjInfo
        })

        _this.initCurrentProduct(skuOptions)

        let track_obj_GIO = {}

        track_obj_GIO = _this.get_product_info_GIO()
        GIO_utils.send_track_function('productDetailPageView', track_obj_GIO)

        let setPage_obj_GIO = {}

        setPage_obj_GIO.productMainName_pvar =
          _this.data.productData.title || ''
        // setPage_obj_GIO.productFirstCategory_pvar = (this.data.productData.categories.length > 0) ? this.data.productData.categories[0].name : '';
        setPage_obj_GIO.productMainId_pvar = track_obj_GIO.productMainId_var
        setPage_obj_GIO.productId_pvar = track_obj_GIO.productId_var
        setPage_obj_GIO.brandId_pvar = track_obj_GIO.brandId_var
        setPage_obj_GIO.brandName_pvar = track_obj_GIO.brandName_var
        setPage_obj_GIO.productSkuAttr_pvar = track_obj_GIO.productSkuAttr_var
        setPage_obj_GIO.originalPrice_pvar = track_obj_GIO.originalPrice_var
        setPage_obj_GIO.retailPrice_pvar = track_obj_GIO.retailPrice_var
        setPage_obj_GIO.displayPrice_pvar = track_obj_GIO.displayPrice_var

        GIO_utils.send_setPage_function(setPage_obj_GIO)
      }
    })
  },

  /**
   * 获得在售商品id合集(需要并区分闪购和非闪购)
   */
  getOnSellProductsIdsFOrN: function(data) {
    let onSellProductsIds = []
    const isFlashsale = this.data.isFlashsale

    if (isFlashsale) {
      data.forEach(function(product) {
        if (product.remains > 0) {
          onSellProductsIds.push(product.id)
        }
      })
    } else {
      data.forEach(function(product) {
        if (product.stock > 0) {
          onSellProductsIds.push(product.id)
        }
      })
    }

    return onSellProductsIds
  },

  /**
   * 当前的商品
   */
  initCurrentProduct: function(skuOptions) {
    let productData = this.data.productData
    let id = this.data.id
    let that = this
    let productSkus = []
    const isFlashsale = this.data.isFlashsale

    productData.products.forEach(product => {
      if (product.id == id) {
        // 初始化轮播图

        for (let i = 0; i < product.images.length; i++) {
          let processImage = product.images[i].image
          if (util.needPrecssImage(processImage)) {
            processImage = processImage + constant.imageSuffix.productFocus
          }

          product.images[i].image = processImage
        }

        that.initSwiperImages(product.images)
        if (!isFlashsale) {
          // 初始化活动类型
          that.initPromotions(product)
          // 初始化服务
          that.initDialogService(productData.brand.service)
        }
        that.setData({
          currentProduct: product
        })
      }
      // 初始化 sku 对应的商品id
      productSkus.push(that.initProductSkuId(product))
    })

    this.data.productSkus = productSkus
    this.initSelectedData(this.data.currentProduct.skus, skuOptions)
  },

  /**
   * 初始化 sku 对应的商品id
   */
  initProductSkuId: function(product) {
    let skuIds = []
    product.skus.forEach(sku => {
      skuIds.push(sku.value_id)
    })

    skuIds.sort((a, b) => {
      return a - b
    })

    let obj = Object.create(null)
    obj[skuIds.join('-')] = product.id

    return obj
  },

  /**
   * 初始化活动类型 promotionspromotions
   */
  initPromotions: function(product) {
    let promotions = product.promotionmains
    promotions.forEach(promotion => {
      promotion.promotionName = promotion.promotion_name
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const productId = this.data.id

    if (this.data.isFlashsale) {
      util.printLog('wechat_app', 'go_to_flashsale', productId)
    } else {
      util.printLog('wechat_app', 'go_to_product', productId)
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getGuessYouLikeArr()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const productMainName_var = this.data.productData
      ? this.data.productData.title
      : '未加载完'
    const brandName_var = this.data.productData
      ? this.data.productData.brand.name
      : '未加载完'

    const obj_GIO = {
      sharePage_var: '正常商品详情',
      productMainName_var,
      brandName_var
    }

    let url_options = {
      channel: '小程序分享',
      pageName: '正常商品详情',
      goodsName: encodeURIComponent(productMainName_var),
      goodsBrand: encodeURIComponent(brandName_var)
    }

    if (this.data.isFlashsale) {
      obj_GIO.sharePage_var = '闪购商品详情'
      url_options.pageName = '闪购商品详情'
    }

    GIO_utils.send_track_function('shareSuccess', obj_GIO)
    let new_url = util.return_current_url_with_options(url_options)

    const title = this.data.productData
      ? this.data.productData.title
      : '汉光百货'
    return {
      title: title,
      path: new_url
    }
  },

  /**
   * 监听页面滚动
   */
  onPageScroll: function(e) {
    // 这里不能设置插件，因为这个多了一个showFixTab属性需要设置

    const _this = this
    const screenHeight = this.data.screenHeight
    let showReturnTop = false

    Taro.createSelectorQuery()
      .select('#product-detail-top')
      .boundingClientRect(function(rect) {
        if (e.scrollTop > screenHeight) {
          showReturnTop = true
        }

        if (e.scrollTop >= rect.height) {
          _this.setData({
            showFixTab: true,
            showReturnTop
          })
        } else {
          _this.setData({
            showFixTab: false,
            showReturnTop
          })
        }
      })
      .exec()
  },

  /**
   * 点击回到顶部
   */
  returnTop: function() {
    Taro.pageScrollTo({
      scrollTop: 0
    })
  },

  /**
   * 点击tab来切换图文详情和商品参数
   */
  changeTabItem: function(e) {
    const tabIndex = e.currentTarget.dataset.index
    this.setData({
      tabIndex
    })
  },

  /**
   * 点击图文详情可以放大查看
   */
  previewImage: function(e) {
    const image = e.currentTarget.dataset.imageUrl
    Taro.previewImage({
      urls: [image]
    })
  },

  /**
   * 联系专柜 - 打电话
   */
  brand_handleMakePhoneCall: function() {
    let productData = this.data.productData

    Taro.makePhoneCall({
      phoneNumber: productData.brand.shop.contact
    })
  },

  /**
   * 进入专柜
   */
  brand_navigateToMiniProgram: function() {
    let currentProduct = this.data.currentProduct
    const brandId = this.data.productData.brand.id

    Taro.navigateTo({
      url: '/pages/brand/detail/detail?id=' + brandId
    })
  },

  /**
   * 添加到购物车
   */
  addProductToCard: function(e) {
    const id = this.data.currentProduct.id
    util.printLog('wechat_app', 'add_cart', id)

    // 点击添加到购物车，向后台发formId
    const formId = e.detail.formId || ''
    util.postFormId(formId, 'addCart')

    const { select } = this.data
    const _this = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: constant.addProduct,
      method: 'POST',
      data: {
        product_id: id,
        quantity: select.num
      },
      success: function(data) {
        _this.getCartProductNum()

        Taro.showToast({
          icon: 'success',
          title: '添加成功'
        })

        select.show = false
        _this.setData({
          select
        })

        const product = _this.data.productData
        const currentProduct = _this.data.currentProduct

        let track_obj_GIO = {}

        track_obj_GIO = _this.get_product_info_GIO()
        track_obj_GIO.addToCartNumber_var = select.num

        GIO_utils.send_track_function('addToCartSuccess', track_obj_GIO)
      }
    })
  },

  /**
   * 点击闪购的立即抢购
   */
  clickFlashsale: function(e) {
    // 点击闪购的立即抢购，向后台发formId
    const formId = e.detail.formId || ''
    util.postFormId(formId, 'flashsaleAddCart')

    const id = this.data.currentProduct.flashsale.id
    util.printLog('wechat_app', 'add_cart', id)

    let track_obj_GIO = {}
    track_obj_GIO = this.get_product_info_GIO()
    track_obj_GIO.addToCartNumber_var = 1
    GIO_utils.send_track_function('addToCartSuccess', track_obj_GIO)

    Taro.navigateTo({
      url: '/packageA/flashsale/buy/buy?id=' + id
    })
  },

  /**
   * 进入商品详情页面，先判断token是否有效，如果有效就获得购物车件数，如果无效也不要做处理
   */
  judgeTokenStatus: function() {
    util.judgeTokenStatus(
      res => {
        this.getCartProductNum()
      },
      () => {}
    )
  },

  /**
   * 购物车的件数
   */
  getCartProductNum: function() {
    const _this = this

    util.request({
      url: constant.getCartProductNum,
      method: 'GET',
      success: function(data) {
        console.log(data.quantity__sum)
        Taro.setStorageSync('cart_num', data.quantity__sum)
        if (data.quantity__sum > 0) {
          _this.setData({
            cartProductNum: data.quantity__sum
          })
          // wx.setStorage({
          //   key:'cart_num',
          //   data: ƒdata.quantity__sum
          // })
        }
      }
    })
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
   * 点击活动时，显示活动详情
   */
  activity_showActivityDesc: function(e) {
    this.turnToInfo(e)
  },

  /**
   * 获得同品牌的商品
   */
  getBrandProductData: function(fromWhere) {
    const productPage = 1
    const pageNum = 10
    const minNum = 5
    const id = this.data.brandId
    const _this = this
    const guessLikePage = this.data.guessLikePage
    let brandProductData = []

    let url =
      constant.getBrandProductsList2 +
      '?brand_id=' +
      id +
      '&page=' +
      productPage +
      '&page_size=' +
      pageNum
    if (fromWhere == 'fromLike') {
      url =
        constant.getBrandProductsList2 +
        '?brand_id=' +
        id +
        '&page=' +
        guessLikePage +
        '&page_size=' +
        pageNum
    }

    util.request({
      url: url,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        _this.data.brandProdTotalLength = res.total
        if (fromWhere == 'fromLike') {
          // “猜你喜欢”模块调用的
          _this.getProductsSellStatus(res.results.products, 'brand', 'fromLike')
        } else if (fromWhere == 'fromBrand') {
          // “同品牌商品”模块调用的
          if (res.count > minNum) {
            _this.getProductsSellStatus(
              res.results.products,
              'brand',
              'fromBrand'
            )
          }
        }
      }
    })
  },

  /**
   * 给数据加上库存状态
   */
  getProductsSellStatus: function(data, keyWord, fromWhere) {
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

        if (keyWord == 'brand') {
          _this.handleBrandProductsListData(data, onSellProductsIds, fromWhere)
        } else if ((keyWord = 'recommend')) {
          _this.handleRecommendProductsListData(
            data,
            onSellProductsIds,
            fromWhere
          )
        }
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
  handleBrandProductsListData: function(products, onSellIds, fromWhere) {
    let brandProduct = []
    let guessYouLikeArr = this.data.guessYouLikeArr

    for (let i = 0; i < products.length; i++) {
      let obj = {}
      const val = products[i]
      obj.originalPrice = val.original_price
      obj.retailPrice = val.display_price
      obj.title = val.brand + val.name
      obj.id = val.id
      obj.activeArr = val.promotion_names
      obj.sellOut = false

      if (fromWhere == 'fromBrand') {
        this.brand_id_and_for_GIO[
          val.id
        ] = this.return_recommend_product_info_GIO(products[i], i, '品牌推荐')
      } else if (fromWhere == 'fromLike') {
        // 猜你喜欢数组是可以分页获取的，并且不一定是品牌或者同品类，所以坑位需要以下计算方式
        const list_index = guessYouLikeArr.length + i
        this.guess_id_and_for_GIO[
          val.id
        ] = this.return_recommend_product_info_GIO(
          products[i],
          list_index,
          '更多好货'
        )
      }

      let processImage = val.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }
      obj.img = processImage

      // 加上库存状态
      if (onSellIds.indexOf(val.productmain_id) < 0) {
        obj.sellOut = true
      }

      brandProduct.push(obj)
    }

    if (fromWhere == 'fromBrand') {
      this.setData({
        brandProductData: brandProduct
      })
    } else if (fromWhere == 'fromLike') {
      guessYouLikeArr = guessYouLikeArr.concat(brandProduct)
      this.data.guessLikePage++

      if (
        this.data.recommendTotalLength + this.data.brandProdTotalLength <=
        guessYouLikeArr.length
      ) {
        // 已经加载完了所有的推荐品类，和品牌下所有东西

        this.setData({
          guessLikeflag: 2,
          guessLikePage: 1,
          isLoading: 'nomore'
        })
      }
      this.setData({
        guessYouLikeArr
      })
    }
  },

  /**
   * 处理推荐的产品列表数据
   */
  handleRecommendProductsListData: function(products, onSellIds, fromWhere) {
    let recommendArr = []
    let recommendProduct = this.data.recommendProduct
    let guessYouLikeArr = this.data.guessYouLikeArr

    for (let i = 0; i < products.length; i++) {
      let obj = {}
      const val = products[i]
      obj.originalPrice = val.original_price
      obj.retailPrice = val.display_price
      obj.title = val.brand + val.name
      obj.id = val.id
      obj.activeArr = val.promotion_names
      obj.sellOut = false

      if (fromWhere == 'fromRecommend') {
        this.kind_id_and_for_GIO[
          val.id
        ] = this.return_recommend_product_info_GIO(products[i], i, '为你推荐')
      } else if (fromWhere == 'fromLike') {
        // 猜你喜欢数组是可以分页获取的，并且不一定是品牌或者同品类，所以坑位需要以下计算方式
        const list_index = guessYouLikeArr.length + i
        this.guess_id_and_for_GIO[
          val.id
        ] = this.return_recommend_product_info_GIO(
          products[i],
          list_index,
          '更多好货'
        )
      }

      let processImage = val.image
      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.squareM
      }
      obj.img = processImage

      // 加上库存状态
      if (onSellIds.indexOf(val.productmain_id) < 0) {
        obj.sellOut = true
      }

      recommendArr.push(obj)
    }

    if (fromWhere == 'fromRecommend') {
      if (recommendArr.length < 7) {
        recommendProduct[0] = recommendArr.slice(0, 6)
      } else if (recommendArr.length < 13) {
        recommendProduct[0] = recommendArr.slice(0, 6)
        recommendProduct[1] = recommendArr.slice(6, 12)
      } else {
        recommendProduct[0] = recommendArr.slice(0, 6)
        recommendProduct[1] = recommendArr.slice(6, 12)
        recommendProduct[2] = recommendArr.slice(12, 18)
      }
    } else if (fromWhere == 'fromLike') {
      guessYouLikeArr = guessYouLikeArr.concat(recommendArr)
      this.data.guessLikePage++

      if (this.data.recommendTotalLength == guessYouLikeArr.length) {
        // 已经加载完了所有的推荐品类，开始加载推荐品牌

        this.setData({
          guessLikeflag: 1,
          guessLikePage: 1
        })
      }
    }

    this.setData({
      recommendProduct,
      guessYouLikeArr
    })
  },

  /**
   * 获得推荐的商品
   */
  getRecommendProduct: function(categories, fromWhere) {
    if (categories.length == 0) {
      this.data.guessLikeflag = 1
      return
    }

    const categoriesArr = this.getCategoriesArr(categories)
    const _this = this

    let postObj = {
      keyword: '', // 初始的搜索字
      page: 1,
      sort: {
        default: ''
      }
    }
    postObj.filters = {}
    postObj.filters.categories = categoriesArr
    postObj.page_size = 18
    if (fromWhere == 'fromLike') {
      postObj.page_size = 10
      postObj.page = this.data.guessLikePage
    }

    util.request({
      url: constant.getProductList,
      method: 'POST',
      data: postObj,
      hasToken: false,
      success: function(res) {
        _this.data.recommendTotalLength = res.total

        if (fromWhere == 'fromLike') {
          // “猜你喜欢”模块调用的
          _this.getProductsSellStatus(
            res.results.products,
            'recommend',
            'fromLike'
          )
        } else if (fromWhere == 'fromRecommend') {
          // “同品类商品”模块调用的
          if (res.results.products.length >= 6) {
            _this.getProductsSellStatus(
              res.results.products,
              'recommend',
              'fromRecommend'
            )
          }
        }
      }
    })
  },

  /**
   * 获得分类数组
   */
  getCategoriesArr: function(categories) {
    let categoriesArr = []

    if (categories.length > 0) {
      for (let i = 0; i < categories.length; i++) {
        categoriesArr.push(categories[i].name)
      }
    }

    return categoriesArr
  },

  /**
   * 滑动为你推荐模块
   */
  productSwiperChange: function(e) {
    const currentSwiper = e.detail.current
    this.setData({
      currentSwiper
    })
  },

  /**
   * 获得猜你喜欢块的商品
   */
  getGuessYouLikeArr: function() {
    const guessLikeflag = this.data.guessLikeflag

    if (guessLikeflag == 0) {
      // 需要加载同种分类的商品
      const categories = this.data.categories
      this.getRecommendProduct(categories, 'fromLike')
    } else if (guessLikeflag == 1) {
      // 需要加载同品牌的商品
      this.getBrandProductData('fromLike')
    }
  },

  /**
   * 点击进入商品详情
   */
  linkToProductInfo: function(e) {
    const id = e.currentTarget.dataset.id
    const _this = this

    // 开定时器是因为在不改动组件的情况下
    // 需要知道发送给GIO的推荐商品信息来自于哪个模块
    // 根据事件冒泡机制，先调用linkToProductInfo，后调用click_recommed_GIO
    // 所以等10毫秒让等click_recommed_GIO先执行完，拿到点击的模块信息发送给GIO
    setTimeout(function() {
      if (id) {
        _this.get_product_GIO_info(id)

        Taro.navigateTo({
          url: '/packageA/product/detail/detail?id=' + id,
          success: function(res) {},
          fail: function(err) {
            util.printLog('wechat_app', 'too_deep', '')
            Taro.reLaunch({
              url: '/packageA/product/detail/detail?id=' + id
            })
          }
        })
      }
    }, 10)
  },

  /**
   * 点击进入20周年庆
   */
  goTo20yearPage: function() {
    Taro.navigateTo({
      url: '/pages/gridsNew/index?from_share=1&id=11'
    })
  },

  /**
   * 返回推荐的商品信息
   */
  return_recommend_product_info_GIO: function(
    product,
    product_index,
    modal_type
  ) {
    let obj = {}

    obj.productId_var = product.id
    obj.productMainName_var = product.brand + ' ' + product.name
    obj.brandName_var = product.brand
    obj.productSkuAttr_var = product.sku_attr
    obj.skuDep_var = product.shop_name
    obj.skuFloor_var = product.floor_name
    obj.campaignName_var = product.promotion_titles.join('|')
    obj.campaignType_var = product.promotion_names.join('|')
    obj.listIndex_var = product_index
    obj.screenNum_var = 0
    obj.pageName_var = '商品详情页'
    obj.pageId_var = this.data.id
    obj.recommendType_var = modal_type

    return obj
  },

  /**
   * 点击推荐位置
   */
  click_recommed_GIO: function(e) {
    const recommend_type = e.currentTarget.dataset.recommend_type
    this.click_recommend_type_GIO = recommend_type
  },

  /**
   * 得到点击推荐位的商品的GIO信息
   */
  get_product_GIO_info: function(id) {
    const recommend_type = this.click_recommend_type_GIO
    let obj_GIO = {}

    switch (recommend_type) {
      case this.data.R_BRAND:
        obj_GIO = this.brand_id_and_for_GIO[id]
        break

      case this.data.R_KIND:
        obj_GIO = this.kind_id_and_for_GIO[id]
        break

      case this.data.R_GUESS:
        obj_GIO = this.guess_id_and_for_GIO[id]
        break
    }

    GIO_utils.send_track_function('recommendGoodsClick', obj_GIO)

    const recommend_page_obj = {
      recommendPage_evar: '商品详情页'
    }
    GIO_utils.send_setEvar_function(recommend_page_obj)

    const recommend_type_obj = {
      recommendType_evar: obj_GIO.recommendType_var
    }
    GIO_utils.send_setEvar_function(recommend_type_obj)
  },

  /**
   * 整理给GIO的商品信息
   */
  get_product_info_GIO: function() {
    const product = this.data.productData
    const currentProduct = this.data.currentProduct
    let product_GIO = {}

    product_GIO.productMainName_var = product.title || ''
    // product_GIO.productFirstCategory_var = (product.categories.length > 0) ? product.categories[0].name : '';
    product_GIO.productMainId_var = currentProduct.productmain_id || ''
    product_GIO.productId_var = currentProduct.id || ''
    product_GIO.brandId_var = product.brand.id || ''
    product_GIO.brandName_var = product.brand.name || ''
    product_GIO.productSkuAttr_var = currentProduct.sku_attr || ''
    product_GIO.originalPrice_var = currentProduct.original_price || ''
    product_GIO.retailPrice_var = currentProduct.retail_price || ''
    product_GIO.displayPrice_var = currentProduct.display_price || ''
    product_GIO.skuDep_var = currentProduct.shop.name || ''
    product_GIO.skuFloor_var = currentProduct.shop.floor_name
    product_GIO.cartSource_var = '正常加购'
    product_GIO.orderType_var = GIO_utils.return_order_type(
      this.data.isFlashsale ? 'flashsale' : 'online'
    )
    product_GIO.campaignName_var = currentProduct.promotionmains
      ? this.returnPromotionStr('promotionName', currentProduct.promotionmains)
      : ''
    product_GIO.campaignType_var = currentProduct.promotionmains
      ? this.returnPromotionStr('promotionType', currentProduct.promotionmains)
      : ''

    return product_GIO
  },

  /**
   * for GIO:返回活动名称/类型字符串
   */
  returnPromotionStr: function(returnType, promotion) {
    let str = ''

    if (returnType == 'promotionName') {
      promotion.forEach(function(item) {
        str += '|' + item.title
      })
    } else if (returnType == 'promotionType') {
      promotion.forEach(function(item) {
        str += '|' + item.promotion_name
      })
    }

    if (str) {
      str = str.slice(1)
    }

    return str
  }
}

const config = util.assignObject(
  pageConfig,
  swiper,
  footerProduct,
  dialogService,
  // activityConfig,
  selectConfig,
  promotionInfo
)

@withWeapp('Page', config)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '商品详情',
    enablePullDownRefresh: false
  }

  render() {
    const {
      productData: productData,
      subtitle: subtitle,
      currentProduct: currentProduct,
      old: old,
      isFlashsale: isFlashsale,
      select: select,
      brandLogo: brandLogo,
      name: name,
      R_BRAND: R_BRAND,
      brandProductData: brandProductData,
      R_KIND: R_KIND,
      recommendProduct: recommendProduct,
      currentSwiper: currentSwiper,
      briefDescription: briefDescription,
      productInfoImage: productInfoImage,
      tabIndex: tabIndex,
      showFixTab: showFixTab,
      R_GUESS: R_GUESS,
      inx: inx,
      guessYouLikeArr: guessYouLikeArr,
      isLoading: isLoading,
      showReturnTop: showReturnTop,
      otherInfo: otherInfo,
      promotionLevel: promotionLevel,
      showPromInfo: showPromInfo,
      swiper: swiper,
      imageUrl: imageUrl,
      footerProduct: footerProduct,
      cartProductNum: cartProductNum,
      existProductLength: existProductLength,
      SERVICE_PHONE: SERVICE_PHONE,
      optionsToFlag2DArr: optionsToFlag2DArr,
      categoryNameArr: categoryNameArr,
      categoryIndex: categoryIndex,
      categoryItem: categoryItem,
      optionIndex: optionIndex,
      optionsNameObj: optionsNameObj,
      optionsToOptionId2DArr: optionsToOptionId2DArr,
      isSku: isSku
    } = this.state
    return (
      <Block>
        <View className="page">
          <View id="product-detail-top" className="product-detail-top">
            <View className="page-section page-section-spacing swiper">
              <View className="swiper-out">
                <Text className="swiper-item-current">
                  {swiper.current + '/' + swiper.length}
                </Text>
                <Swiper
                  onChange={this.swiperHandleChange}
                  current={swiper.current - 1}
                  circular="true"
                >
                  {swiper.images.map((imageUrl, idx) => {
                    return (
                      <SwiperItem key={'product-detail-swiper-' + idx}>
                        <View className="swiper-item">
                          <Image src={imageUrl.image}></Image>
                        </View>
                      </SwiperItem>
                    )
                  })}
                </Swiper>
              </View>
              {/* <template is="swiper" data="{{...swiper}}"></template> */}
            </View>
            {/* 标题 */}
            <View className="detail-title">
              <ProductTitleFullTmpl
                data={{
                  mainTitle: (productData.title, subtitle)
                }}
              ></ProductTitleFullTmpl>
              {isFlashsale ? (
                <Block>
                  <PriceBoxTmpl
                    data={{
                      newPrice: (currentProduct.flashsale.price, old)
                    }}
                  ></PriceBoxTmpl>
                </Block>
              ) : (
                <Block>
                  {currentProduct.retail_price ==
                  currentProduct.display_price ? (
                    <Block>
                      <PriceBoxTmpl
                        data={{
                          newPrice: (currentProduct.retail_price, old)
                        }}
                      ></PriceBoxTmpl>
                    </Block>
                  ) : (
                    <Block>
                      <View className="show-display-price">
                        <View className="price-left">
                          <Span className="small-span">￥</Span>
                          {currentProduct.retail_price}
                        </View>
                        <View className="price-right">
                          <Span className="small-red">到手价</Span>
                          <View className="small-red-text">
                            ￥
                            <Span className="small-red-price">
                              {currentProduct.display_price}
                            </Span>
                          </View>
                        </View>
                      </View>
                    </Block>
                  )}
                </Block>
              )}
              {/* <view class="detail-title-href">
                                                                                                                                                                                                                                                                                                                                                                                                                            <template is="orangeHref" data="{{ orangeHref }}"></template>
                                                                                                                                                                                                                                                                                                                                                                                                                          </view> */}
            </View>
            {/* 选择、活动、服务 */}
            <View className="weui-cells weui-cells_after-title product-info">
              <View
                className="weui-cell weui-cell_access"
                onClick={this.select_handleShowSelect}
              >
                {/*  <view class="weui-cell__hd">请选择</view>  */}
                <View className="weui-cell__bd">
                  <Span className="font-size-12-grey">已选：</Span>
                  {currentProduct.sku_attr + ' x ' + select.num}
                </View>
                <View className="weui-cell__ft weui-cell__ft_in-access"></View>
              </View>
              {!isFlashsale && currentProduct.promotionmains.length > 0 && (
                <View className="weui-cell pt0 pb0 pr0">
                  <View className="weui-cell__hd detail-activity">活动</View>
                  <View className="weui-cell__bd">
                    <ActivityTmpl
                      data={{
                        promotions: currentProduct.promotionmains
                      }}
                    ></ActivityTmpl>
                  </View>
                </View>
              )}
              <View
                className="weui-cell"
                onClick={this.handleShowDialogService}
              >
                <View className="weui-cell__hd">服务</View>
                <View className="weui-cell__bd service-box">
                  <View className="service-item">
                    <I className="sparrow-icon icon-product-service"></I>
                    <Text>正品保障</Text>
                  </View>
                  <View className="service-item">
                    <I className="sparrow-icon icon-product-service"></I>
                    <Text>无忧售后</Text>
                  </View>
                  <View className="service-item">
                    <I className="sparrow-icon icon-product-service"></I>
                    <Text>极速退款</Text>
                  </View>
                  <View className="service-item">
                    <I className="sparrow-icon icon-service-warning"></I>
                    <Text>退换货特别提示</Text>
                  </View>
                </View>
              </View>
            </View>
            {/* 专柜 */}
            <BrandTmpl
              data={{
                logo: (brandLogo, name)
              }}
            ></BrandTmpl>
            {/*  <view class='scroll-item' wx:if="{{brandProductData.length > 6}}">  */}
            {brandProductData.length > 5 && (
              <View
                className="scroll-item"
                data-recommend_type={R_BRAND}
                onClick={this.click_recommed_GIO}
              >
                <ScrollViewcMoreTmpl
                  data={{
                    productData: brandProductData
                  }}
                ></ScrollViewcMoreTmpl>
              </View>
            )}
            {recommendProduct.length > 1 && (
              <View
                className="product-details"
                data-recommend_type={R_KIND}
                onClick={this.click_recommed_GIO}
              >
                <DetailTitleTmpl
                  data={{
                    value: '为你推荐'
                  }}
                ></DetailTitleTmpl>
                <View className="recommend-out-view">
                  <CarouselfTmpl
                    data={{
                      productData: (recommendProduct, currentSwiper)
                    }}
                  ></CarouselfTmpl>
                </View>
              </View>
            )}
          </View>
          {/*  只有商品参数  */}
          {productData.description.length <= 0 &&
          productInfoImage.length <= 0 ? (
            <View className="product-details">
              <DetailTitleTmpl
                data={{
                  value: '商品参数'
                }}
              ></DetailTitleTmpl>
              <PropertyTmpl
                data={{
                  attrs: (currentProduct.attrs, briefDescription)
                }}
              ></PropertyTmpl>
            </View>
          ) : (
            (productData.description.length > 0 ||
              productInfoImage.length > 0) && (
              <View>
                {showFixTab ? (
                  <Block>
                    <View className="info-detail-tab fixed">
                      <View
                        className="info-detail-tab-item"
                        data-index="0"
                        onClick={this.changeTabItem}
                      >
                        <View
                          className={
                            'info-detail-tab-text ' +
                            (tabIndex == 0 ? 'item-red' : '')
                          }
                        >
                          图文详情
                        </View>
                      </View>
                      <View
                        className="info-detail-tab-item"
                        data-index="1"
                        onClick={this.changeTabItem}
                      >
                        <View
                          className={
                            'info-detail-tab-text ' +
                            (tabIndex == 1 ? 'item-red' : '')
                          }
                        >
                          商品参数
                        </View>
                      </View>
                    </View>
                    <View className="info-detail-tab info-height"></View>
                  </Block>
                ) : (
                  <Block>
                    <View className="info-detail-tab">
                      <View
                        className="info-detail-tab-item"
                        data-index="0"
                        onClick={this.changeTabItem}
                      >
                        <View
                          className={
                            'info-detail-tab-text ' +
                            (tabIndex == 0 ? 'item-red' : '')
                          }
                        >
                          图文详情
                        </View>
                      </View>
                      <View
                        className="info-detail-tab-item"
                        data-index="1"
                        onClick={this.changeTabItem}
                      >
                        <View
                          className={
                            'info-detail-tab-text ' +
                            (tabIndex == 1 ? 'item-red' : '')
                          }
                        >
                          商品参数
                        </View>
                      </View>
                    </View>
                  </Block>
                )}
                {tabIndex == 0 ? (
                  <View className="product-details-box">
                    {productData.description.map((item, index) => {
                      return (
                        <Image
                          mode="widthFix"
                          key={'product-description-' + index}
                          src={item}
                          data-image-url={item}
                          onClick={this.previewImage}
                        ></Image>
                      )
                    })}
                    {productInfoImage.map((item, index) => {
                      return (
                        <Image
                          mode="widthFix"
                          key={'product-description-' + index}
                          src={item}
                          data-image-url={item}
                          onClick={this.previewImage}
                        ></Image>
                      )
                    })}
                  </View>
                ) : (
                  tabIndex == 1 && (
                    <PropertyTmpl
                      data={{
                        attrs: (currentProduct.attrs, briefDescription)
                      }}
                    ></PropertyTmpl>
                  )
                )}
              </View>
            )
          )}
          {/*  不只有商品参数，还有图文详情  */}
          {/*  猜你喜欢  */}
          <View className="product-details more-product">
            <DetailTitleTmpl
              data={{
                value: '更多好货'
              }}
            ></DetailTitleTmpl>
            <View
              data-recommend_type={R_GUESS}
              onClick={this.click_recommed_GIO}
              className="def-background"
            >
              {guessYouLikeArr.map((item, idx) => {
                return (
                  <Block key={'guess-you-like-' + inx}>
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
          </View>
          <View className="height-100"></View>
          {showReturnTop && (
            <View className="return-top" onClick={this.returnTop}>
              <I className="sparrow-icon icon-return-top"></I>
            </View>
          )}
          {showPromInfo && (
            <Block>
              <PromotionInfoTmpl
                data={{
                  otherInfo: (otherInfo, promotionLevel)
                }}
              ></PromotionInfoTmpl>
            </Block>
          )}
          {/*  去20周年庆页面  */}
          {/*  <image src="/image/to20years.png" style="position:fixed; top:0; right: 20rpx; height: 120rpx; width: 82rpx; z-index: 100" bindtap="goTo20yearPage"></image>  */}
        </View>
        {/* 页脚 */}
        <View className="footer-product">
          <View className="footer-product-item">
            {footerProduct.showMenu ? (
              <Button
                className="footer-product-btn1 footer-product-btnclose"
                onClick={this.handleFooterProductShowMenu}
              >
                <I className="sparrow-icon icon-close"></I>
              </Button>
            ) : (
              <Button
                className="footer-product-btn1"
                onClick={this.handleFooterProductShowMenu}
              >
                <I className="sparrow-icon icon-menu-popup icon-hint"></I>
                <Text className="hint-text">菜单</Text>
              </Button>
            )}
            {/* 打开更多 */}
            {/* 专柜 */}
            <Button className="footer-product-btn1" onClick={this.clickToBrand}>
              <I className="sparrow-icon icon-shop icon-hint"></I>
              <Text className="hint-text">专柜</Text>
            </Button>
            {/* 购物车 */}
            <Button className="footer-product-btn1" onClick={this.clickToCart}>
              {cartProductNum > 0 && (
                <View className="small-red-number">{cartProductNum}</View>
              )}
              <I className="sparrow-icon icon-shopping-cart icon-hint"></I>
              <Text className="hint-text">购物车</Text>
            </Button>
          </View>
          <View className="footer-product-item">
            <Button className="footer-product-btn1 no-right"></Button>
          </View>
          <View className="footer-product-item">
            {isFlashsale ? (
              <Block>
                {existProductLength > 0 ? (
                  <Button
                    className="footer-product-btn2"
                    onClick={this.select_handleShowSelect}
                  >
                    立即抢购
                  </Button>
                ) : (
                  <Button className="product-btn3">立即抢购</Button>
                )}
              </Block>
            ) : (
              <Block>
                {existProductLength > 0 ? (
                  <Button
                    onClick={this.select_handleShowSelect}
                    className="footer-product-btn2"
                  >
                    加入购物车
                  </Button>
                ) : (
                  <Button className="product-btn3">加入购物车</Button>
                )}
              </Block>
            )}
            {/*  非闪购详情  */}
            {/*  || existProductLength > 0  */}
          </View>
          {/* menu */}
          {footerProduct.showMenu && (
            <View className="footer-product-menu clearfix">
              <View onClick={this.clickToSearchPage}>
                <I className="sparrow-icon icon-search"></I>
                <Text>搜索</Text>
              </View>
              <View onClick={this.clickToIndexPage}>
                <I className="sparrow-icon icon-home"></I>
                <Text>首页</Text>
              </View>
              {/*  <view url="#" open-type="redirect">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     <i class="sparrow-icon icon-star2" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     <text>收藏</text>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   </view>  */}
              <View onClick={this.clickToCallToService}>
                <I className="sparrow-icon icon-service-tel"></I>
                <Text>客服</Text>
              </View>
              <View onClick={this.clickToUserCenter}>
                <I className="sparrow-icon icon-personal-center"></I>
                <Text>我的</Text>
              </View>
            </View>
          )}
        </View>
        dialogService.show &&{' '}
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
        <Block>
          {/* 选择规格参数 */}
          <View
            className="dialog-service"
            style={'display: ' + (select.show ? 'block' : 'none') + ';'}
          >
            <View
              className="dialog-shade"
              onClick={this.select_handleCloseSelect}
            ></View>
            {/* 弹框 */}
            <View className="dialog-service-box">
              <View
                className="dialog-service-close"
                onClick={this.select_handleCloseSelect}
              >
                <I className="sparrow-icon icon-close"></I>
              </View>
              {/* 头部 */}
              <View className="dialog-product clearfix">
                <View className="dialog-product-l">
                  <Image
                    src={currentProduct.images[0].image}
                    onClick={this.productPreviewImg}
                  ></Image>
                </View>
                <View className="dialog-product-r">
                  {!isFlashsale ? (
                    <PriceBoxTmpl
                      data={{
                        newPrice: (currentProduct.retail_price, old)
                      }}
                    ></PriceBoxTmpl>
                  ) : (
                    <PriceBoxTmpl
                      data={{
                        newPrice: (currentProduct.flashsale.price, old)
                      }}
                    ></PriceBoxTmpl>
                  )}
                  <View className="dialog-product-r-selected">
                    {'已选择：' + currentProduct.sku_attr + ' x ' + select.num}
                  </View>
                  {/*  <view class="dialog-product-r-tip">
                                                                                                                                                        <text>库存紧张</text>
                                                                                                                                                      </view>  */}
                </View>
              </View>
              {/* 内容 */}
              <View className="scroll-out-view">
                <ScrollView className="dialog-product-content" scrollY="true">
                  {optionsToFlag2DArr.map((categoryItem, categoryIndex) => {
                    return (
                      <View className="select-box" key={'product-sku-' + index}>
                        <View className="select-head">
                          {categoryNameArr[categoryIndex]}
                        </View>
                        <View className="select-item clearfix">
                          {categoryItem.map((optionItem, optionIndex) => {
                            return (
                              <Text
                                onClick={this.clickSelectOption}
                                key={'product-option-item-' + optionIndex}
                                className={
                                  optionsToFlag2DArr[categoryIndex][
                                    optionIndex
                                  ] == 2
                                    ? ' current '
                                    : optionsToFlag2DArr[categoryIndex][
                                        optionIndex
                                      ] == 1
                                    ? ''
                                    : 'disable'
                                }
                                data-category-index={categoryIndex}
                                data-option-index={optionIndex}
                              >
                                {
                                  optionsNameObj[
                                    optionsToOptionId2DArr[categoryIndex][
                                      optionIndex
                                    ]
                                  ]
                                }
                              </Text>
                            )
                          })}
                        </View>
                      </View>
                    )
                  })}
                  {!isFlashsale && (
                    <View className="select-box">
                      <View className="choose-number">
                        <View className="select-head">数量</View>
                        <View className="select-item clearfix">
                          <Button
                            onClick={this.handleSkuSubtract}
                            className={
                              'btn-number-l ' +
                              (select.num <= 1 ? 'btn-number-disable' : '')
                            }
                          >
                            -
                          </Button>
                          <Input
                            disabled="true"
                            onInput={this.handleNumChange}
                            className="btn-number-value"
                            type="number"
                            value={select.num}
                          ></Input>
                          <Button
                            onClick={this.handleSkuAdd}
                            className="btn-number-r"
                          >
                            +
                          </Button>
                        </View>
                      </View>
                    </View>
                  )}
                  <View className="height-30"></View>
                </ScrollView>
              </View>
              <View className="dialog-btnbox">
                {isFlashsale ? (
                  <View className="width-100">
                    <Form onSubmit={this.clickFlashsale} reportSubmit="true">
                      {isSku && existProductLength > 0 ? (
                        <Button
                          className="footer-product-btn2"
                          formType="submit"
                        >
                          立即抢购
                        </Button>
                      ) : (
                        <Button className="product-btn3">立即抢购</Button>
                      )}
                    </Form>
                  </View>
                ) : (
                  <View className="width-100">
                    <Form onSubmit={this.addProductToCard} reportSubmit="true">
                      {isSku && existProductLength > 0 ? (
                        <Button
                          className="footer-product-btn2"
                          formType="submit"
                        >
                          加入购物车
                        </Button>
                      ) : (
                        <Button className="product-btn3">加入购物车</Button>
                      )}
                    </Form>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Block>
      </Block>
    )
  }
}

export default _C
