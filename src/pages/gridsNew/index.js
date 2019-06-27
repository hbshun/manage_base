import {
  Block,
  View,
  ScrollView,
  Image,
  Text,
  Video,
  Input,
  Icon,
  Label,
  Swiper,
  SwiperItem
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import grids from 'grids.js'
import util from '../../utils/util.js'

import Csearch from '../../component/c-search/c-search'
import './index.scss'

@withWeapp('Page', grids)
class _C extends Taro.Component {
  config = {
    enablePullDownRefresh: true,
    navigationBarTitleText: '汉光购物',
    backgroundColorTop: '#fff'
  }

  render() {
    const {
      anchorText: anchorText,
      scroll_view_height: scroll_view_height,
      backgroundColor: backgroundColor,
      scrollTop: scrollTop,
      backgroundImage: backgroundImage,
      gridsRows: gridsRows,
      rowIndex: rowIndex,
      rowItem: rowItem,
      gridsData: gridsData,
      productRow: productRow,
      productList: productList,
      topicProductsList: topicProductsList,
      showReturnTop: showReturnTop,
      showReturnToHome: showReturnToHome,
      dialogGetCoupon: dialogGetCoupon,
      user_hasToken: user_hasToken
    } = this.state
    return (
      <View className="page">
        <Block>
          {/*  <import src="../../component/tabbar/tabbar.wxml" />  */}
          <ScrollView
            scrollWithAnimation
            enableBackToTop
            scrollY="true"
            scrollIntoView={anchorText}
            id="product-detail-top"
            style={
              'height: ' +
              scroll_view_height +
              '; background-color: ' +
              backgroundColor +
              ';'
            }
            onScroll={this.scrollView}
            scrollTop={scrollTop}
            upperThreshold="1"
            lowerThreshold="1"
            onScrollToUpper={this.scroll_to_top}
            onScrollToLower={this.scroll_to_bottom}
          >
            <View
              style={'background-image: url(' + backgroundImage + ');'}
              className="background-normal"
            >
              {gridsRows.map((rowItem, rowIndex) => {
                return (
                  <Block key={'grids-row-' + rowIndex}>
                    {/*  这里有个坑：只能用一个搜索框，因为田字格大页写了固定的id用于页面的页面滚动事件后调用组件的方法，而一个页面的id最多只有一个（其实后续可以用rowId，但是配合这个还需要写其他东西，所以一期先只能用一个）  */}
                    {rowItem.nodeType == 'search' ? (
                      <Block>
                        <Csearch
                          id="c-search"
                          iconSearch="sparrow-icon icon-search"
                          placeholder={gridsData[rowItem.item[0]].placeholder}
                          url={gridsData[rowItem.item[0]].url}
                          data-index={rowIndex}
                          onClick={this.click_gp_search}
                        ></Csearch>
                      </Block>
                    ) : rowItem.nodeType == 'image' ? (
                      <Block>
                        <DisplayImageTmpl
                          data={{
                            imgRow: (rowItem, gridsData)
                          }}
                        ></DisplayImageTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'navi' ? (
                      <Block>
                        <DisplayNavbarTmpl
                          data={{
                            navbarRow: (rowItem, gridsData)
                          }}
                        ></DisplayNavbarTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'space' ? (
                      <Block>
                        <EmptyContentTmpl
                          data={{
                            emptyRow: rowItem
                          }}
                        ></EmptyContentTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'swiper' ||
                      rowItem.nodeType == 'focus' ? (
                      <Block>
                        <DisplayImageCarouselTmpl
                          data={{
                            imageCarouselRow: (rowItem, gridsData)
                          }}
                        ></DisplayImageCarouselTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'video' ? (
                      <Block>
                        <ShowVideoTmpl
                          data={{
                            videoRow: rowItem
                          }}
                        ></ShowVideoTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'brand' ? (
                      <Block>
                        <BrandListTmpl
                          data={{
                            hotBrandRow: (rowItem, gridsData)
                          }}
                        ></BrandListTmpl>
                      </Block>
                    ) : rowItem.nodeType == 'products' ? (
                      <Block>
                        {(rowItem.displayType == 'waterfall_2' ||
                          rowItem.displayType == 'waterfall_3') && (
                          <DisplayProductListTmpl
                            data={{
                              type: (rowItem.displayType, productRow)
                            }}
                          ></DisplayProductListTmpl>
                        )}
                        {/*  横向滚动  */}
                        {rowItem.displayType == 'scroll_view' ? (
                          <DisplayProductScrollTmpl
                            data={{
                              productRow: (rowItem, productList)
                            }}
                          ></DisplayProductScrollTmpl>
                        ) : (
                          (rowItem.displayType == 'swiper_2' ||
                            rowItem.displayType == 'swiper_3' ||
                            rowItem.displayType == 'swiper_6') && (
                            <DisplayProductCarouselTmpl
                              data={{
                                productRow: (rowItem, productList)
                              }}
                            ></DisplayProductCarouselTmpl>
                          )
                        )}
                        {/*  2件轮播,3件轮播，6件轮播  */}
                      </Block>
                    ) : rowItem.nodeType == 'topic' ? (
                      <Block>
                        <PromotionListTmpl
                          data={{
                            topicRow: (rowItem, topicProductsList)
                          }}
                        ></PromotionListTmpl>
                      </Block>
                    ) : (
                      rowItem.nodeType == 'brandwall' && (
                        <Block>
                          <BrandWallTmpl
                            data={{
                              brandWall: (rowItem, gridsData)
                            }}
                          ></BrandWallTmpl>
                        </Block>
                      )
                    )}
                    {/*  图片  */}
                    {/*  导航  */}
                    {/*  辅助空白  */}
                    {/*  轮播：焦点图  */}
                    {/*  video  */}
                    {/*  品牌列表  */}
                    {/*  商品类型  */}
                    {/*  专题类型  */}
                    {/*  品牌墙  */}
                  </Block>
                )
              })}
              {/*  图片  */}
              {/*  <template is="displayImage" data="{{chunkArr: row.item, gridsData: gridsData}}"></template>  */}
              {/*  商品：2、3件瀑布流  */}
              {/*  <template is="displayProductList" data="{{productList3: productList3}}"></template>  */}
              {/*  商品：横向滑动  */}
              {/*  <template is="displayProductScroll" data="{{productList3: productList3}}"></template>  */}
              {/*  中间固定导航  */}
              {/*  <template is="displayNavbar" data="{{navbarImg: navbarImg, type:'absolute'}}"></template>  */}
              {/*  轮播  */}
              {/*  <template is="displayProductCarousel" data="{{productCarouselList6: productCarouselList6, productCarouselList2: productCarouselList2, productCarouselList3: productCarouselList3,currentSwiper: 1}}"></template>  */}
              {/*  顶部固定导航  */}
              {/*  <template is="displayNavbar" data="{{navbarImg: navbarImg, type:'top-fixed'}}"></template>  */}
              {/*  底部固定导航  */}
              {/*  <template is="displayNavbar" data="{{navbarImg: navbarImg, type:'bottom-fixed'}}"></template>  */}
              {/*  辅助空白  */}
              {/*  <template is="emptyContent" data="{{height: '3000rpx',backgroundColor: '#ccc', backgroundImg: 'https://img-backend.hanguangbaihuo.com/media%2Fshop_image%2FIMG_7080.JPG'}}"></template>  */}
              {/*  video  */}
              {/*  <template is="showVideo" data="{{videoSrc: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'}}"></template>  */}
              {/*  搜索  */}
              {/*  <template is="showSearch" data="{{search_big_div: search_big_div, search_bar_form: search_bar_form, inputVal: inputVal, inputShowed: inputShowed}}"></template>  */}
              {/*  品牌推荐  */}
              {/*  <template is="brandList" data="{{hotBrandData: hotBrandData, backgroundColor: '#ccc', backgroundImg: 'https://img-backend.hanguangbaihuo.com/media%2Fshop_image%2FIMG_7080.JPG'}}"></template>  */}
              {/*  活动列表  */}
              {/*  <template is="promotionList" data="{{promotionData: promotionData}}"></template>  */}
              {/*  轮播：焦点图  */}
              {/*  <template is="displayImageCarousel" data="{{swiperData: swiperData}}"></template>  */}
              {/*  <template is="emptyContent" data="{{height: '200rpx',backgroundColor: '#ccc', backgroundImg: 'https://img-backend.hanguangbaihuo.com/media%2Fshop_image%2FIMG_7080.JPG'}}"></template>  */}
            </View>
          </ScrollView>
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
          {/*  <template is="tabbar" data="{{tabbar}}"/>  */}
          {/*  <block wx:if="isLoading!=''">
                                                                                        <view class="list-foot">
                                                                                          <block wx:if="{{isLoading=='nomore'}}">没有更多了</block>
                                                                                          <block wx:else>加载中...</block>
                                                                                        </view>
                                                                                      </block>  */}
          {/*  <template is="displayNavbar" data="{{navbarRow: gridsRows[8], gridsData: gridsData}}"></template>  */}
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
                  ) : dialogGetCoupon.couponHome.style ==
                    'OneBrandOneCoupon' ? (
                    <Block>
                      <CouponStylebTmpl
                        data={(dialogGetCoupon, user_hasToken)}
                      ></CouponStylebTmpl>
                    </Block>
                  ) : dialogGetCoupon.couponHome.style ==
                    'OneBrandTwoCoupon' ? (
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
      </View>
    )
  }
}

export default _C
