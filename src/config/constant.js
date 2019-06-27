/**
 * constant
 */

// 测试地址api

// const host = 'https://backend5.dongyouliang.com/api';
// const userMemberhost = 'https://backend5.dongyouliang.com/api/xx/o';

// 线上地址api
const host = 'https://backend5.hanguangbaihuo.com/api'
const userMemberhost = 'https://backend5.hanguangbaihuo.com/api/xx/o'

let constant = {
  KEY_USER: 'key_user',
  appId: 'app_1521010788',
  // AppId: 'wx5c8a9897143b0cf8',
  host: host,
  userMemberhost: userMemberhost,
  rpxRatio: 2, // 后台页面传过来的数据px数据是按蓬蓬给的以750宽作为比对给出的px单位值，所以想用rpx单位的话需要*2
  ADDTOCARTNUM: 5, // 加入进购物车的商品数量
  imageSuffix: {
    productInfo: '?x-oss-process=image/resize,m_lfit,w_1080', // 商品详情页 详情=
    focus: '?x-oss-process=image/resize,m_fixed,w_1080,h_460', // 首页 焦点图=,新品页面焦点图,活动推荐列表图，活动推荐详情头图
    topic: '?x-oss-process=image/resize,m_fixed,w_675,h_375', // 首页 活动推荐图
    hotBrand: '?x-oss-process=image/resize,m_fixed,w_480,h_360', // 首页 热门品牌图
    productFocus: '?x-oss-process=image/resize,m_fixed,w_1080,h_1080', // 商品详情页 焦点
    brandFocus: '?x-oss-process=image/resize,m_fixed,w_640,h_480', // 品牌页头
    squareM: '?x-oss-process=image/resize,m_fixed,w_560,h_560', // 中等正方形 商品列表页面里的图，首页热销单品会用到,品牌列表中的商品列表
    squareS: '?x-oss-process=image/resize,m_fixed,w_360,h_360', // 小正方形 商品列表页面里的图，首页闪购、新品上架预览图
    squareXS: '?x-oss-process=image/resize,m_fixed,w_220,h_220' // 加小正方形 首页热门品牌logo，品牌页面品牌logo, 商品详情品牌logo
  },

  SERVICE_PHONE: '010-66018899',
  CONSULATION_PHONE: '010-63608662',
  // 性别
  SEX_OPTIONS: [
    {
      name: 'F',
      value: '男'
    },
    {
      name: 'M',
      value: '女'
    }
  ],

  /**
   * 自提或者快递
   */
  shippingMethod: {
    SELF_SERVICE: 'self_service',
    EXPRESS: 'express'
  },

  /**
   * 售后状态
   */
  aftersaleStatus: {
    OPEN: 'open',
    DONE: 'done'
  },

  /**
   * 订单状态
   */
  orderStatusOptions: [
    {
      name: 'all',
      value: '全部'
    },
    {
      name: 'unpaid',
      value: '待付款'
    },
    {
      name: 'init',
      value: '待发货'
    },
    {
      name: 'to_pickup',
      value: '可自提'
    },
    {
      name: 'after_sale',
      value: '售后'
    },
    {
      name: 'completed',
      value: '已完成'
    }
  ],

  /**
   * 底部tab栏的地址
   */
  footerTabUrl: [
    '/pages/index/index',
    '/pages/category/category',
    '/pages/brand/index/index',
    '/pages/cart/index/index',
    '/pages/usercenter/index/index'
  ],

  /**
   * 通用接口
   */
  // 发送短信验证码
  sendSMS: 'https://backend5.hanguangbaihuo.com/api/sms/send/',

  /**
   * 小程序登录
   */
  // 小程序登录第一步(code登录)
  // loginCode: `${host}/wechat/app/login/wechat_app_code/`,
  // 小程序登录第二步(绑定登录)
  // loginBind: `${host}/wechat/app/login/bind/`,
  // 小程序登录第一步(code登录)
  loginCode: `${host}/v1/wechat/app/login/wechat_app_code/`,
  // 小程序登录第二步(绑定登录)
  loginBind: `${host}/v1/wechat/app/login/bind/`,
  // 短信登录
  // loginPhone: `${host}/sms/login/`,
  // 验证 token 是否有效
  tokenVerification: `${host}/account/token/verification/`,

  /**
   * product
   */
  getShopList: `${host}/sparrow_search/search/`,
  // 商品详情
  // getProduct: `${host}/sparrow_products/products/`,
  getProduct: `${host}/sparrow_search/search/productmain/`,
  // 商品列表
  getProductList: `${host}/sparrow_search/search/product/`,
  // 闪购商品详情
  getFlashsaleProduct: `${host}/sparrow_search/search/flashsaleproductmain/`,

  /**
   * order
   */
  getOrderInfo: `${host}/sparrow_cart/cart/ready_to_pay/`,
  chooseAddress: `${host}/sparrow_cart/cart/address/`,
  loadAddress: `${host}/address/user/`,
  loadExpress: `${host}/sparrow_cart/cart/shippings/`,
  loadAllCoupons: `${host}/sparrow_cart/cart/coupons/`,
  postNote: `${host}/sparrow_cart/cart/note/`,
  createOrder: `${host}/sparrow_cart/cart/order/`,
  postOrder: `${host}/wechat/app/wxapp_pay_config/`,

  /**
   * 购物车
   */
  cart: `${host}/sparrow_cart/cart/self/`, // 获取购物车，改变购物车中的产品数量
  chooseProduct: `${host}/sparrow_cart/cart/product/choose/`, // 在购物车里选择对这件商品勾选与否
  chooseGift: `${host}/sparrow_cart/cart/gift/`, // 选择赠品
  chooseFixedPrice: `${host}/sparrow_cart/cart/gift_product/`, // 选择加价购商品
  addProduct: `${host}/sparrow_cart/cart/product/add/`, // 添加商品进入购物车
  modifyPromotions: `${host}/sparrow_cart/cart/product/promotion/`, // 修改商品参加的活动
  getPromotionInfo: `${host}/sparrow_promotions/show_promotionmains/`, // 查看商品详情
  getCartStatus: `${host}/sparrow_cart/cart/stock/status/`, // 检查购物车库存状态
  getCartProductNum: `${host}/sparrow_cart/cart/product_num/`, // 获取购物车件数

  /**
   * 会员中心
   */

  // 清除用户信息缓存
  clearUserCache: `${host}/account/clear_user_cache/`,
  // 用户信息
  getUserSimpleInfo: `${host}/account/member/`,
  // 帮助中心
  help: `${host}/sparrow_admin/helps/`,
  // 获取用户条码
  getMemberCode: `${host}/member/member_code`,
  // 手机开票订单
  orderPhone: `${host}/offline/orders/`,
  // 线上订单
  orderLine: `${host}/sparrow_orders/user_simple_orders/`,
  // 线上订单详情
  orderLineDetail: `${host}/sparrow_orders/user_orders/`,
  // 删除线上订单 http://backend5.dongyouliang.com/api/sparrow_orders/orders/6/
  orderLineDelete: `${host}/sparrow_orders/user_orders/`,
  // 取消订单
  orderLineCancel: `${host}/sparrow_orders/cancel/`,
  // 获得配货单详情
  assignmentInfo: `${host}/sparrow_orders/assignments/`,
  // // 修改手机号--线上
  // changeOnlinePhone: `${host}/account/phone/`,
  // 修改手机号--统一
  changePhone: `${host}/account/user/phone/xx/`,

  // 根据手机号获取帐户积分及券信息
  getPoint: `${userMemberhost}/account/point`,
  // // 修改手机号--线下
  // changePhone: `${userMemberhost}/account/chgphone`,
  // 积分兑换
  exchangePoint: `${userMemberhost}/account/charge`,
  // 获取线下订单记录
  getShoppingRecord: `${userMemberhost}/account/offorder`,
  // 更新会员姓名、生日等信息
  updateUserInfo: `${userMemberhost}/account/upbirthorname`,
  // 获取可使用的礼券列表
  getUsableCouponList: `${userMemberhost}/account/coupon/usable`,
  // 获取最近一年已使用的礼券列表
  getUsedCouponList: `${userMemberhost}/account/coupon/use`,
  // 获取最近一年已过期的礼券列表
  getExpiredCouponList: `${userMemberhost}/account/coupon/expire`,
  // 获取停车券列表
  getCarCouponList: `${userMemberhost}/account/carcouponlist`,
  // 优惠券列表(不包括停车券)
  getCouponList: `${userMemberhost}/account/couponlist`,
  // 获取发票抬头列表
  getInvoiceTitleList: `${userMemberhost}/account/invoice/invtitle/list`,
  // 添加发票抬头
  addInvoiceTitle: `${userMemberhost}/account/invoice/invtitle/add`,
  // 获取发票抬头信息
  getInvoiceTitleInfo: `${userMemberhost}/account/invoice/invtitle`,
  // 更新发票抬头信息
  updateInvoiceTitle: `${userMemberhost}/account/invoice/invtitle/update`,
  // 删除发票抬头
  deleteInvoiceTitle: `${userMemberhost}/account/invoice/invtitle/delete`,
  // 根据订单编号获取可开具发票的信息
  getInvoiceInfo: `${userMemberhost}/account/invocie`,
  // 线下订单开立发票
  requestOfflineInvoice: `${userMemberhost}/InvoiceApi/einvoice/submitEC`,

  // 根据account_id获取会员绑定的车牌号列表
  getLicensePlateList: `${userMemberhost}/parking/account/list`,
  // 根据车牌号获取停车记录
  getParkingInfo: `${userMemberhost}/parking/info/`,
  // 绑定车牌号
  bindLicensePlate: `${userMemberhost}/parking/account/bindcarnumber`,
  // 解绑车牌号
  untyingLicensePlate: `${userMemberhost}/parking/account/unbindcarnumber`,
  // 创建停车订单
  createParkingOrder: `${userMemberhost}/parking/create_order/`,
  // 调起微信支付
  wexinPay: `${userMemberhost}/parking/pay/`,

  /**
   * 手机开票支付
   */
  // 验证订单
  // orderPhoneValidate: `${host}/offline/order/payment/validate/`,
  // 返回支付配置
  // orderPhoneConfig: `${host}/wechat/mp/jsapi_pay_config/`,

  /**
   * 闪购
   */
  // 闪购商品列表 /sparrow_search/search/flashsaleproduct/
  flashSaleList: `${host}/sparrow_search/search/flashsaleproduct/`,
  // 闪购下单页
  flashSaleOrder: `${host}/sparrow_cart/flash_cart/`,
  // 当前期闪购活动
  flashSalePromotions: `${host}/sparrow_promotions/flashsale/`,

  /**
   * 专题页面
   */
  getTopicProductData: `${host}/sparrow_admin/home/topic/`,

  /**
   * 简单专题商品数据（商品全有货不用查库存,并且可以加上返回数量）
   */
  getSimpleProductData: `${host}/sparrow_admin/home/simple_topic/`,

  /**
   * 新品页面
   */
  getFreshProductData: `${host}/sparrow_admin/home/new_product/`,

  /**
   * 新品头图
   */
  getFlashTopicImage: `${host}/sparrow_admin/home/new_product/image/`,

  /**
   * 首页
   */
  //获得焦点图信息
  getSwiperData: `${host}/sparrow_admin/home/focus/`,
  //获新品上架信息
  getFreshData: `${host}/sparrow_admin/home/new_product/`,
  //获活动推荐的信息
  getTopicData: `${host}/sparrow_admin/home/topic/`,
  //获闪购特惠的信息
  getFlashsaleData: `${host}/sparrow_admin/home/flashsale/`,
  //获热门品牌的信息
  getHotBrandData: `${host}/sparrow_admin/home/brand/`,
  //获热搜品类的信息
  getHotProductData: `${host}/sparrow_admin/home/category/`,
  //获热销单品的信息
  getSkuListData: `${host}/sparrow_admin/home/hot_product/`,
  // test
  test: `${host}/service/test/cache/?format=json`,

  /**
   * brand
   */
  // 专柜列表
  brand:
    'https://backend5.hanguangbaihuo.com/api/sparrow_admin/simple_brands/?page_size=300',
  // 专柜详情 /sparrow_admin/simple_brands/1/
  brandDetail: `${host}/sparrow_admin/simple_brands/`,
  // 专柜详情包含活动
  brandDetailAndActive: `${host}/sparrow_admin/brands/`,
  // 专柜分类
  brandcategories:
    'https://backend5.hanguangbaihuo.com/api/sparrow_admin/brandcategories/',
  // 楼层数据
  floors: 'https://backend5.hanguangbaihuo.com/api/shop/floors/',
  // 推荐品牌
  recommendedBrands:
    'https://backend5.hanguangbaihuo.com/api/sparrow_admin/simple_brand_recommends/',
  // 获得专柜下的产品信息
  getBrandProductsList:
    'https://backend5.hanguangbaihuo.com/api/sparrow_search/search/product/',
  // 专柜向下的商品(用1还是2需要问后端)
  getBrandProductsList2: `${host}/sparrow_search/search/brand_product/`,
  // 默认品牌图片
  // brandDefaultImage: 'https://image.dongyouliang.com/media/shop_image/default.jpg',
  brandDefaultImage:
    'https://img-backend.hanguangbaihuo.com/media/shop_image/brandDefault.png',
  // 日志
  log: 'https://backend5.hanguangbaihuo.com/api/service/log/',
  // 获得热销分类数据
  getCategoryListData: `${host}/sparrow_products/simple_category/`,
  // 获得商品库存状态
  getProductsSellStatus: `${host}/sparrow_products/products/sell_status/`,
  // 获得闪购库存状态
  getFlashsaleSellStatus: `${host}/sparrow_products/flashsaleproducts/sell_status/`,
  // 获得物流信息详情
  getExpressInfo: `${host}/sparrow_shipping/express_orders/route/`,
  // 获得发票类型
  getInvoiceType: `${host}/sparrow_admin/invoice/`,
  // 获得可开立发票金额
  getOnlineInvoiceValue: `${host}/sparrow_orders/cash_payment/`,
  // 向后台发送开发票请求
  requestOnlineInvoice: `${host}/sparrow_admin/invoice/`,
  // 长连接转成短连接
  turnToShortUrl: `${host}/service/short_url/`,
  // 发送短信
  sendToMessage: `${host}/sms/content/`,
  // 查看闪购物品专柜信息
  flashsaleInfo: `${host}/sparrow_orders/flashsale_shop_info/`,
  // 打印日志
  printLog: `${host}/service/sparrow/log/`,
  // 退出登录
  userLogout: `${host}/wechat/app/logout/`,
  // 获取openId对应的虚拟id
  getVirtualOpenId: `${host}/wechat/app/anonymous/`,
  // 获得热门搜索
  getHotSearchKey: `${host}/sparrow_search/search/popular/`,
  // 获得搜索历史
  getSearchHistory: `${host}/sparrow_search/search/history/`,

  /**
   * 自动售货机
   */
  // 购物车 https://backend5.dongyouliang.com/api/vending_machine/cart/self/?order_id=12345&product_id=1&app_id=app_1534851431&timestamp=1534853718&nonce=23455&sign=A1D05398BE89B4906006364DE2725579
  vendingMachineCart: `${host}/vending_machine/cart/self/`,
  // 获得田字格内容
  getGridsData: `${host}/sparrow_admin/grid/topics/`,
  // 获得新田字格内容
  getGPData: `${host}/gorgeous_page/grid/`,
  // 获得可分页的homeTopic
  getHomeTopicData: `${host}/sparrow_admin/home/topics/`,
  // 获得电子屏订单
  getScreenOrderInfo: `${host}/touch_screen/cart/self/`,
  // 获得电子屏订单专柜数据
  getScreenShopInfo: `${host}/sparrow_orders/screen/shop_info/`,
  // 获得提货二维码
  getQRcodeInfo: `${host}/sparrow_orders/screen/order_qrcode_content/`,
  // 获取优惠券
  // couponsHome: `${host}/sparrow_coupons/home/`,
  // couponsCoupons: `${host}/sparrow_coupons/coupons/`,
  // 获取优惠券新流程
  couponsHome: `${host}/sparrow_advert_popup/advert/?is_expired=false&is_active=true&untaken=true`,
  couponsCoupons: `${host}/sparrow_advert_popup/advert_coupons/?is_active=true&untaken=true`,
  couponsFetched: `${host}/sparrow_advert_popup/advert/user/`,

  // 把formId发送给后台
  postFormId: `${host}/wechat/app/form_id/`,
  // 注册协议
  loginProtocol: `${host}/sparrow_admin/helps/16/`,
  // 获得首页（gp大页）的内容
  getIndexGPData: `${host}/gorgeous_page/grid/main/`,
  // 商品详情后添加的图片
  getProductInfoImage: `${host}/sparrow_products/padding_image/`,
  // 获得rfid下单信息
  getRfidOrderInfo: `${host}/rfid/cart/`,

  // gio开关
  switch_GIO: `${host}/gio/switch/`
}

export default constant
