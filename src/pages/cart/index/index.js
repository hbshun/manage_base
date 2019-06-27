import {
  Block,
  View,
  Image,
  Text,
  Form,
  Button,
  MovableArea,
  MovableView,
  Icon,
  Input,
  Label
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../utils/util.js'
import brandItem from '../brandItem/brandItem.js'
import constant from '../../../config/constant.js'
import product from '../product/product.js'
import attendActivity from '../attendActivity/attendActivity.js'
import promotionInfo from '../../../component/promotionInfo/promotionInfo.js'
import returnTop from '../../../component/returnTop/returnTop.js'
import GiftTmpl from '../../../imports/GiftTmpl.js'
import BrandItemTmpl from '../../../imports/BrandItemTmpl.js'
import ActivityTmpl from '../../../imports/ActivityTmpl.js'
import './index.scss'
const app = Taro.getApp()
const indexPage = {
  /**
   * 页面的初始数据
   */
  data: {
    wholeActivity: [], // 全场活动obj数组
    fixedpriceAndGift: {},
    // 活动（全场and品牌）对象，key为活动id，值为对象，包括：
    // 1、活动类型
    // 2、可选择产品（买赠，加价购专属）·
    // 3、已选择产品（买赠，加价购专属）
    // 4、可选赠品/加价购/返券的数量（如果不满足最低活动条件或者活动类型为满减等是没有这一项的）
    // 5、返券数组
    brandData: [], // 所有品牌信息obj数组
    wholeGift: {}, // 把全场活动（买赠，加价购）拼成品牌信息obj
    totalPrice: '', // 显示总金额
    totalDisPrice: '', // 已优惠金额
    chosenProducts: [], // 被选择的产品(删除已选、全选会用到)
    allProducts: [], // 所有产品（点击全选会用到）
    showPromotion: false, // 是否进入活动商品选择页
    promotionId: '', // 点击活动,进入活动商品选择页面，并获得的活动id
    caculateNum: 0, // 结算商品数量
    movableViewWidth: '750rpx', //movable-view 的宽度
    deleteWidth: '150rpx', //删除的宽度
    currentProduct: {}, // 当前滑动的product
    tabbar: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.getCart(); //因为修改活动完成跳回来之后需要重新加载，所以把这个函数写在监听页面显示里（若能找到调用navigateBack的函数调用时，能实时刷新，则就去掉onshow里的this.getCart()）
    const _this = this
    Taro.getSystemInfo({
      success: function(res) {
        console.log(res.screenWidth)
        const deleteWidth = Math.floor(res.screenWidth * 0.2)
        _this.setData({
          movableView: res.screenWidth + 'px',
          deleteWidth: deleteWidth + 'px'
        })
      }
    })

    this.getScreenHeight()
    // app.changeTabBar();
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
    // 重新打开购物车需要 活动中购物车的商品选择页面
    this.setData({
      showPromotion: false
    })

    this.getCart() //重新选择活动的时候会用到
    util.printLog('wechat_app', 'go_to_cart', '')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 如果打开了活动中购物车的商品选择页面，对商品选择进行刷新
    if (this.data.showPromotion) {
      this.setData({
        page: 0,
        shopData: []
      })
      this.getPromotionId(this.data.promotionId)
    } else {
      this.setData({
        wholeActivity: [], // 全场活动obj数组
        fixedpriceAndGift: {},
        brandData: [], // 所有品牌信息obj数组
        wholeGift: {}, // 把全场活动（买赠，加价购）拼成品牌信息obj
        totalPrice: '', // 显示总金额
        totalDisPrice: '', // 已优惠金额
        chosenProducts: [], // 被选择的产品(删除已选、全选会用到)
        allProducts: [], // 所有产品（点击全选会用到）
        showPromotion: false, // 是否进入活动商品选择页
        promotionId: '' // 点击活动,进入活动商品选择页面，并获得的活动id
      })

      this.getCart() //重新选择活动的时候会用到
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 如果打开了活动中购物车的商品选择页面，对商品选择进行刷新
    if (this.data.showPromotion) {
      if (this.data.isLoading == 'nomore') {
        return
      }
      this.getData()
    }
  },

  /**
   * 获取购物车
   */
  getCart: function() {
    Taro.showToast({
      icon: 'loading',
      title: '正在加载中...',
      mask: true,
      duration: 20000
    })

    const that = this
    util.request({
      url: constant.cart,
      method: 'GET',
      success: function(data) {
        console.log(data)
        Taro.stopPullDownRefresh()
        Taro.hideToast()
        // that.initialData(that.data.testData);
        that.initialData(data)
      }
    })
  },

  /**
   * 对数据进行初始化并在页面中显示
   */
  initialData: function(data) {
    let all_num = 0
    for (let i = 0; i < data.brand_count; i++) {
      let productsCount = data.brands[i].products
      for (let m = 0; m < productsCount.length; m++) {
        all_num += productsCount[m].quantity
      }
    }
    if (data.brand_count > 0) {
      this.data.caculateNum = 0
      let fixedpriceAndGift = this.data.fixedpriceAndGift
      const wholeActivity = this.getWholeActivity(
        data.hg.promotions,
        fixedpriceAndGift
      )
      const brandData = this.getBrandData(data.brands, fixedpriceAndGift)
      const wholeGift = this.getWholeGift(data.hg.promotions)
      const totalPrice = data.total_amount
      const totalDisPrice = data.total_discount_price
      Taro.setStorageSync('cart_num', all_num)
      this.setData({
        fixedpriceAndGift,
        wholeActivity,
        brandData,
        wholeGift,
        totalPrice,
        totalDisPrice,
        caculateNum: this.data.caculateNum
      })
    } else {
      Taro.setStorageSync('cart_num', '0')

      this.setData({
        wholeActivity: [],
        fixedpriceAndGift: {},
        brandData: [],
        wholeGift: {},
        totalPrice: '',
        totalDisPrice: '',
        chosenProducts: [],
        allProducts: [],
        showPromotion: false,
        promotionId: ''
        // tabbar
      })
    }

    // 不知道为什么，只有这里再加上这一行，才不会出错，否则购物车里每刷新一次都不能完全收回（不许改哟(＾Ｕ＾））
    Taro.hideToast()
  },

  /**
   * 整理活动成指定规格，然后返回
   */
  getWholeActivity: function(hg, fixedpriceAndGift) {
    let data = []

    for (let i = 0; i < hg.length; i++) {
      let obj = {}
      obj.id = hg[i].id
      obj.promotionName = hg[i].promotion_type.name
      obj.title = hg[i].condition_desc.desc
      obj.hint = hg[i].condition_desc.hint

      fixedpriceAndGift[obj.id] = {}
      fixedpriceAndGift[obj.id].promotionName = obj.promotionName
      fixedpriceAndGift[obj.id].type = hg[i].promotion_type.promotion_type
      fixedpriceAndGift[obj.id].desc = hg[i].condition_desc.desc // 活动描述文字
      fixedpriceAndGift[obj.id].discount_amount = hg[i].discount_amount // 该活动已优惠金额（满减会用到）
      fixedpriceAndGift[obj.id].meet_promotion = hg[i].meet_promotion // 不满足活动时，字段为空

      //不滿足活動就不返回meet_promotion
      if (hg[i].meet_promotion) {
        // 1、活动类型是：返券，加价购，买赠
        // 2、满足活动条件
        // 注意：这里如果是满减等其他类的条件，是没有fixedpriceAndGift[obj.id].chooseNum的
        if (fixedpriceAndGift[obj.id].type == 'COUPON') {
          fixedpriceAndGift[obj.id].chooseNum = 0 // 展示所有返券，都不可选（只可看）
          fixedpriceAndGift[obj.id].coupons = hg[i].meet_promotion.coupons

          // fixedpriceAndGift[obj.id].coupons = hg[i].meetpromotion.coupons;
        } else if (fixedpriceAndGift[obj.id].type == 'GIFT') {
          fixedpriceAndGift[obj.id].chooseNum =
            hg[i].meet_promotion.b_gift_unit_num // 可以选择的赠品数量
          fixedpriceAndGift[obj.id].gifts = hg[i].gifts
          fixedpriceAndGift[obj.id].selectedGifts = hg[i].selected_gifts
        } else if (fixedpriceAndGift[obj.id].type == 'FIXED_PRICE') {
          fixedpriceAndGift[obj.id].chooseNum = hg[i].meet_promotion.b_fixed_num // 可以选择的加价购
          fixedpriceAndGift[obj.id].gifts = hg[i].gifts
          fixedpriceAndGift[obj.id].selectedGifts = hg[i].selected_gifts
        }
      }

      data.push(obj)
    }
    return data
  },

  /**
   * 整理 品牌 成指定规格，然后返回
   */
  getBrandData: function(brand) {
    let data = []
    let allProducts = [] // 为了保证能在returnChooseStatus里传入并修改，所以采取对象形式
    let chosenProducts = []

    for (let i = 0; i < brand.length; i++) {
      let obj = {}

      obj.id = brand[i].id
      obj.name = brand[i].name
      obj.activity = this.getWholeActivity(
        brand[i].promotions,
        this.data.fixedpriceAndGift
      )
      obj.products = brand[i].products
      obj.gift = this.getGift(brand[i].promotions)
      obj.checked = this.returnChooseStatus(
        brand[i].products,
        allProducts,
        chosenProducts
      )

      for (let i = 0; i < obj.products.length; i++) {
        obj.products[i].x = 0
      }

      data.push(obj)
    }

    this.setData({
      allProducts,
      chosenProducts,
      caculateNum: this.data.caculateNum
    })

    return data
  },

  /**
   * 构建赠品、加价购为品牌规格
   */
  getWholeGift: function(promotions) {
    let brand = {}
    brand.id = 0
    brand.name = '全场活动'
    brand.type = 'wholeActivity'
    brand.gift = this.getGift(promotions)
    return brand
  },

  /**
   * 返回品牌内的产品是否有选中的状态,并且更改allProdLength和products数据
   */
  returnChooseStatus: function(products, allProducts, chosenProducts) {
    let checked = 1 // 0代表没被选中，1代表被选中，2代表不能被选中
    let noStockLength = 0

    for (let i = 0; i < products.length; i++) {
      if (products[i].stock > 0) {
        allProducts.push(products[i].id)
        if (!products[i].checked) {
          checked = 0
          // this.data.caculateNum -= products[i].quantity;
        } else {
          chosenProducts.push(products[i].id)
          this.data.caculateNum += products[i].quantity
        }
      } else {
        noStockLength++
      }
    }

    // 该品牌下商品全是售罄的，就不能被选中
    if (noStockLength == products.length) {
      checked = 2
    }

    return checked
  },

  /**
   * 选出赠品和加价购
   */
  getGift: function(promotions) {
    let gift = []

    for (let i = 0; i < promotions.length; i++) {
      const promotionType = promotions[i].promotion_type.promotion_type

      if (
        (promotionType == 'FIXED_PRICE' || promotionType == 'GIFT') &&
        promotions[i].selected_gifts.length
      ) {
        let obj = {}
        obj.promotion_type = promotionType
        obj.text = promotions[i].promotion_type.name
        obj.giftArr = []
        for (let j = 0; j < promotions[i].selected_gifts.length; j++) {
          obj.giftArr.push(promotions[i].selected_gifts[j])
        }
        gift.push(obj)
      }
    }

    return gift
  },

  /**
   * 点击全选按钮
   */
  clickAllChoose: function(e) {
    const product_ids = this.data.allProducts.join(',')
    const checked = !e.currentTarget.dataset.checked

    const obj = {
      product_ids,
      checked
    }

    this.chooseProduct(obj)
  },

  /**
   * 点击删除已选
   */
  clickDeleteChosen: function() {
    const that = this
    const deleteStr = this.data.chosenProducts.join(',')
    const obj = {
      product_ids: deleteStr
    }
    console.log(deleteStr)

    Taro.showModal({
      title: '提示',
      content: '您确定要删除已选商品么',
      success: res => {
        if (res.confirm) {
          Taro.showToast({
            icon: 'loading',
            mask: true,
            duration: 20000
          })

          util.request({
            url: constant.cart,
            method: 'PUT',
            data: obj,
            success: function(res) {
              that.initialData(res)
              console.log(res)
              Taro.showToast({
                icon: 'success',
                title: '删除成功'
              })
            }
          })
        }
      }
    })
  },

  /**
   * 点击活动（全场和专柜）
   */
  activity_showActivityDesc: function(e) {
    const showPromotion = !this.data.showPromotion
    const promotionId = e.currentTarget.dataset.id
    this.setData({
      showPromotion,
      promotionId
    })
    this.getPromotionId(promotionId, this.dataToTab)

    util.printLog('wechat_app', 'go_to_addbuy', promotionId)
  },

  /**
   * 检查购物车库存
   */
  getCartStatus: function(e) {
    const _this = this
    Taro.showToast({
      icon: 'loading',
      title: '正在加载中...',
      mask: true,
      duration: 20000
    })

    // 点击购物车结算按钮，向后台发formId
    const formId = e.detail.formId || ''
    util.postFormId(formId, 'settleAccounts')

    util.request({
      url: constant.getCartStatus,
      method: 'GET',
      success: function(res) {
        _this.turnToOrder()
      },
      fail: function() {
        // 库存不足刷新购物车（主要是把库存售罄状态显示出来让用户知道）

        _this.setData({
          wholeActivity: [], // 全场活动obj数组
          fixedpriceAndGift: {},
          brandData: [], // 所有品牌信息obj数组
          wholeGift: {}, // 把全场活动（买赠，加价购）拼成品牌信息obj
          totalPrice: '', // 显示总金额
          totalDisPrice: '', // 已优惠金额
          chosenProducts: [], // 被选择的产品(删除已选、全选会用到)
          allProducts: [], // 所有产品（点击全选会用到）
          showPromotion: false, // 是否进入活动商品选择页
          promotionId: '' // 点击活动,进入活动商品选择页面，并获得的活动id
        })

        _this.getCart() //重新选择活动的时候会用到
      }
    })
  },

  /**
   * 跳转到填写订单页面
   */
  turnToOrder: function() {
    Taro.navigateTo({
      url: '/packageA/order/order'
    })
  },

  /**
   * 点击去挑商品
   */
  goToProductList: function() {
    Taro.navigateTo({
      url: '/packageA/product/list/list'
    })
  },

  goBack() {
    console.log('123')
  }
}

const assignedObject = util.assignObject(
  indexPage,
  brandItem,
  product,
  attendActivity,
  promotionInfo,
  returnTop
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '购物车'
  }

  render() {
    const {
      brandData: brandData,
      wholeActivity: wholeActivity,
      brandIndex: brandIndex,
      wholeGift: wholeGift,
      chosenProducts: chosenProducts,
      allProducts: allProducts,
      totalPrice: totalPrice,
      totalDisPrice: totalDisPrice,
      caculateNum: caculateNum,
      showPromotion: showPromotion,
      promotionId: promotionId,
      fixedpriceAndGift: fixedpriceAndGift,
      inputVal: inputVal,
      inputShowed: inputShowed,
      hasTab: hasTab,
      tab: tab,
      tabShow: tabShow,
      showGiftPopup: showGiftPopup,
      shopData: shopData,
      showReturnTop: showReturnTop,
      isLoading: isLoading,
      proGiftArr: proGiftArr,
      showPromInfo: showPromInfo,
      otherInfo: otherInfo,
      promotionLevel: promotionLevel
    } = this.state
    return (
      <Block>
        {/*  <view bindtap='goBack'>返回</view>  */}
        {/*  <import src="../../../component/tabbar/tabbar.wxml" />  */}
        {brandData.length <= 0 ? (
          <View className="cart-empty">
            <View className="circle-grey">
              <Image
                src={require('../../../image/cart/cart-empty.png')}
              ></Image>
            </View>
            <View className="cart-hint">快去把购物车填满吧！</View>
            <View className="select-button" onClick={this.goToProductList}>
              去逛逛
            </View>
          </View>
        ) : (
          <View className="page">
            <View>
              {!showPromotion ? (
                <View className="page-cart">
                  <View className="money-off">
                    <ActivityTmpl
                      data={{
                        promotions: wholeActivity
                      }}
                    ></ActivityTmpl>
                  </View>
                  {brandData.map((item, index) => {
                    return (
                      <Block key="brandData">
                        <BrandItemTmpl
                          data={{
                            brand: (item, brandIndex)
                          }}
                        ></BrandItemTmpl>
                      </Block>
                    )
                  })}
                  {/*  <template is="brandItem" data="{{ brand: brandData[0]}}"></template>   */}
                  {/*  <block if="{{wholeGift.length != 0}}">
                                                                                                       <view class="brand-item">
                                                                                                         <view class="brand-title">
                                                                                                         </view>
                                                                                                         <view class="brand-active">
                                                                                                         </view>
                                                                                                         <block wx:for="{{wholeGift}}" wx:key="*this" wx:for-item="item">
                                                                                                           <template is="gift" data="{{selectedGift: item}}"></template>    
                                                                                                         </block> 
                                                                                                       </view>
                                                                                                     </block>  */}
                  {wholeGift.gift.length > 0 && (
                    <BrandItemTmpl
                      data={{
                        brand: wholeGift
                      }}
                    ></BrandItemTmpl>
                  )}
                  {/*  <view wx:if="{{ chosenProducts.length != 0 }}">    */}
                  {chosenProducts.length == 0 ? (
                    <View className="delete-chosen">
                      <View className="delete-out">
                        <I className="sparrow-icon icon-clear"></I>
                        <Text>删除已选</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="delete-chosen one-more-chosen">
                      <View
                        className="delete-out"
                        onClick={this.clickDeleteChosen}
                      >
                        <I className="sparrow-icon icon-clear"></I>
                        <Text>删除已选</Text>
                      </View>
                    </View>
                  )}
                  {/*  </view>  */}
                  {brandData.length > 0 && (
                    <View className="cart-bottom">
                      <View className="bill-info">
                        <View className="info-left">
                          {chosenProducts.length != allProducts.length ||
                          chosenProducts.length == 0 ? (
                            <I
                              className="sparrow-icon icon-not-choose"
                              onClick={this.clickAllChoose}
                              data-checked={false}
                            ></I>
                          ) : (
                            <I
                              className="sparrow-icon icon-choose"
                              onClick={this.clickAllChoose}
                              data-checked={true}
                            ></I>
                          )}
                          <Text className="info-text">全选</Text>
                        </View>
                        <View className="info-right">
                          <View className="amount">
                            <Text className="small">￥</Text>
                            {totalPrice}
                          </View>
                          {chosenProducts.length == 0 ? (
                            <View className="info-text">尚未选择结算商品</View>
                          ) : (
                            <View className="info-text">
                              {'已优惠￥' + totalDisPrice}
                            </View>
                          )}
                        </View>
                      </View>
                      <Form onSubmit={this.getCartStatus} reportSubmit="true">
                        {chosenProducts.length == 0 ? (
                          <View className="caculate-btn">结算</View>
                        ) : (
                          <Button
                            className="caculate-btn red"
                            formType="submit"
                          >
                            {'结算(' + caculateNum + ')'}
                          </Button>
                        )}
                      </Form>
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  <View className="page" style="background-color:transparent;">
                    <View className="activityInfo">
                      <View className="weui-cells weui-cells_after-title">
                        <View
                          data-id={promotionId}
                          onClick={this.turnToInfo}
                          className="weui-cell weui-cell_access"
                          hoverClass="none"
                        >
                          <View className="weui-cell__bd">
                            以下商品适用于
                            <Span className="activity-type">
                              {fixedpriceAndGift[promotionId].promotionName}
                            </Span>
                            活动
                          </View>
                          <View className="weui-cell__ft weui-cell__ft_in-access">
                            查看活动
                          </View>
                        </View>
                      </View>
                    </View>
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
                              onConfirm={this.searchSend}
                              confirmType="search"
                            ></Input>
                            {inputVal.length > 0 && (
                              <View
                                className="weui-icon-clear"
                                onClick={this.clearInput}
                              >
                                <Icon type="clear" size="14"></Icon>
                              </View>
                            )}
                          </View>
                          <Label
                            className="weui-search-bar__label"
                            hidden={inputShowed}
                            onClick={this.showInput}
                          >
                            <Icon
                              className="weui-icon-search"
                              type="search"
                              size="14"
                            ></Icon>
                            <View className="weui-search-bar__text">搜索</View>
                          </Label>
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
                                (tab.tabShow == 'arrange'
                                  ? 'current-tab'
                                  : '') +
                                '  ' +
                                (tabShow.arrange.name ==
                                tabShow.arrange.showName
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
                                  (tab.tabShow == 'other'
                                    ? 'current-tab'
                                    : '') +
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
                                  (tab.tabShow == 'proAndSer'
                                    ? 'current-tab'
                                    : '') +
                                  '  ' +
                                  (tabShow.proAndSer.name ==
                                  tabShow.proAndSer.showName
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
                                (tab.tabShow == 'filters'
                                  ? 'current-tab'
                                  : '') +
                                '  ' +
                                (tabShow.filters.name ==
                                tabShow.filters.showName
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
                                          (tab.arrangeType == 0
                                            ? 'arrange-red'
                                            : '')
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
                                          (tab.arrangeType == 1
                                            ? 'arrange-red'
                                            : '')
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
                                          (tab.arrangeType == 2
                                            ? 'arrange-red'
                                            : '')
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
                                          (tab.arrangeType == 3
                                            ? 'arrange-red'
                                            : '')
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
                          {/* tab品牌 */}
                          {tab.tabShow == 'other' && (
                            <Block>
                              <ChooseFeatureTmpl
                                data={{
                                  arr: tab.other
                                }}
                              ></ChooseFeatureTmpl>
                            </Block>
                          )}
                          {/* tab活动服务  */}
                          {/*  <block wx:if="{{tab.tabShow=='proAndSer'}}">
                                                                               <template is="chooseFeature" data="{{arr: tab.proAndSer, promotions: promotions}}" />
                                                                             </block>  */}
                          {/* tab筛选 */}
                          {tab.tabShow == 'filters' && (
                            <Block>
                              <View className="filter-div">
                                <View className="price-field">
                                  <View className="price-field-word">
                                    价格区间（元）
                                  </View>
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
                                    arr: tab.filters
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
                        <View
                          className="tab-mask-in"
                          onClick={this.hideTab}
                        ></View>
                      </Block>
                    )}
                    {/* 选择赠品，加价购商品，查看返券时出现的蒙版 */}
                    {showGiftPopup && (
                      <Block>
                        <View
                          className="tab-mask-in2"
                          onClick={this.hideGiftPopup}
                        ></View>
                      </Block>
                    )}
                    {/* 搜索栏出现的蒙版 */}
                    {/* <block wx:if="{{inputShowed==true}}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                         <view class="search-mask-in" bindtap="hideInput"></view>
                                                                                                                                                                                                                                                                                                                                                                                                                                                       </block> */}
                    {/* shop列表展示 */}
                    <Block id="product-detail-top">
                      <View className="shopItem1-out">
                        {shopData.map((item, idx) => {
                          return (
                            <Block key={'shopData-' + index}>
                              <ShopItemaTmpl
                                data={{
                                  '...item,isActivity': true
                                }}
                              ></ShopItemaTmpl>
                            </Block>
                          )
                        })}
                      </View>
                      <ReturnTopTmpl data={showReturnTop}></ReturnTopTmpl>
                    </Block>
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
                    {/*  赠品和换购商品的弹框  */}
                    {showGiftPopup && (
                      <View className="product-gift">
                        <View className="close-popup">
                          <LabelRedTmpl
                            data={{
                              value:
                                fixedpriceAndGift[promotionId].promotionName
                            }}
                          ></LabelRedTmpl>
                          <Span className="activity-info">
                            {fixedpriceAndGift[promotionId].desc}
                          </Span>
                          <Span
                            className="sparrow-icon icon-close"
                            onClick={this.hideGiftPopup}
                          ></Span>
                        </View>
                        <View className="brand-product">
                          <View className="just-product">
                            <GiftTmpl
                              data={{
                                selectedGift: (proGiftArr, promotionId)
                              }}
                            ></GiftTmpl>
                          </View>
                        </View>
                        <View className="promotion-bottom">
                          <View className="product-btn font-center">
                            {fixedpriceAndGift[promotionId].type == 'COUPON' ? (
                              <Span className="main-info"></Span>
                            ) : (
                              <Span className="main-info">
                                {'已经选择' +
                                  proGiftArr.chosenNum +
                                  '/' +
                                  fixedpriceAndGift[promotionId].chooseNum}
                              </Span>
                            )}
                          </View>
                          <View className="return-btn" onClick={this.postGift}>
                            确定
                          </View>
                        </View>
                      </View>
                    )}
                    {/*  选择产品底端的三个按钮 fixedpriceAndGift[promotionId].meet_promotion不为空表示满足活动条件 */}
                    {!showGiftPopup && (
                      <View className="promotion-bottom">
                        <View className="product-btn">
                          <Span className="main-info">
                            {fixedpriceAndGift[promotionId].desc}
                          </Span>
                          {(fixedpriceAndGift[promotionId].type ==
                            'FIXED_PRICE' ||
                            fixedpriceAndGift[promotionId].type == 'GIFT') &&
                          fixedpriceAndGift[promotionId].meet_promotion ? (
                            <View className="sub-info">
                              {'已经选择' +
                                proGiftArr.chosenNum +
                                '/' +
                                fixedpriceAndGift[promotionId].chooseNum}
                            </View>
                          ) : fixedpriceAndGift[promotionId].type == 'COUPON' &&
                            fixedpriceAndGift[promotionId].meet_promotion ? (
                            <View className="sub-info">
                              {'已优惠' +
                                fixedpriceAndGift[promotionId].discount_amount +
                                '元'}
                            </View>
                          ) : (
                            <View className="sub-info"></View>
                          )}
                        </View>
                        {fixedpriceAndGift[promotionId].type == 'FIXED_PRICE' &&
                          fixedpriceAndGift[promotionId].meet_promotion && (
                            <View
                              className="gift-btn"
                              onClick={this.showGiftPopup}
                            >
                              换购商品
                            </View>
                          )}
                        {fixedpriceAndGift[promotionId].type == 'GIFT' &&
                          fixedpriceAndGift[promotionId].meet_promotion && (
                            <View
                              className="gift-btn"
                              onClick={this.showGiftPopup}
                            >
                              选择赠品
                            </View>
                          )}
                        {fixedpriceAndGift[promotionId].type == 'COUPON' &&
                          fixedpriceAndGift[promotionId].meet_promotion && (
                            <View
                              className="gift-btn"
                              onClick={this.showGiftPopup}
                            >
                              查看礼券
                            </View>
                          )}
                        <View
                          className="return-btn"
                          onClick={this.returnToCart}
                        >
                          回购物车
                        </View>
                      </View>
                    )}
                    {/*  商品详情页  */}
                    {showPromInfo && (
                      <Block>
                        <PromotionInfoTmpl
                          data={{
                            otherInfo: (otherInfo, promotionLevel)
                          }}
                        ></PromotionInfoTmpl>
                      </Block>
                    )}
                  </View>
                </View>
              )}
              {/*  点击参加的活动进入活动选择页面  */}
              {/*  <template is="tabbar" data="{{tabbar}}"/>  */}
            </View>
          </View>
        )}
      </Block>
    )
  }
}

export default _C
