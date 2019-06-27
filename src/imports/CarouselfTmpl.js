import {
  Block,
  View,
  Text,
  Image,
  RichText,
  ScrollView,
  Swiper,
  SwiperItem
} from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class CarouselfTmpl extends Taro.Component {
  render() {
    const {
      data: {
        rowIndex: rowIndex,
        productData: productData,
        swiperIndex: swiperIndex,
        swiperItem: swiperItem,
        index: index,
        item: item,
        activeIndex: activeIndex,
        activeArr: activeArr,
        currentSwiper: currentSwiper
      }
    } = this.props
    return (
      <Block>
        <Swiper
          className="recommend-product carousel-6"
          data-row-index={rowIndex}
          circular="true"
          onChange={this.productSwiperChange}
        >
          {productData.map((swiperItem, swiperIndex) => {
            return (
              <Block key={'swiper-pro-active-' + swiperIndex}>
                <SwiperItem className="recommend-product-page">
                  {swiperItem.map((item, index) => {
                    return (
                      <View
                        data-index={index}
                        key={'fresh-data-' + index}
                        className="product-data-item"
                        data-id={item.id}
                        onClick={this.linkToProductInfo}
                      >
                        <View className="recommend-prod-img">
                          {item.sellOut && (
                            <Image
                              lazyLoad="true"
                              src
                              className="sparrow-icon icon-sell-out"
                            ></Image>
                          )}
                          <Image lazyLoad="true" src={item.img}></Image>
                        </View>
                        <View className="brand-product-text">
                          <Text>{item.title}</Text>
                        </View>
                        <View className="brand-product-text red-price">
                          {'￥' + item.retailPrice}
                          {item.originalPrice - item.retailPrice > 0 && (
                            <Span className="old-price">
                              {'￥' + item.originalPrice}
                            </Span>
                          )}
                        </View>
                        <View className="discount-span">
                          {item.activeArr.map((activeArr, activeIndex) => {
                            return (
                              <Span
                                key={'recommend-pro-active-' + activeIndex}
                                className="product-red-small-span"
                              >
                                {activeArr}
                              </Span>
                            )
                          })}
                        </View>
                      </View>
                    )
                  })}
                </SwiperItem>
              </Block>
            )
          })}
        </Swiper>
        {currentSwiper >= 0 && (
          <View className="dots-view carousel-6">
            {productData.map((item, index) => {
              return (
                <Block key={'carousel-6-dots-' + index}>
                  <Span
                    className={
                      'dots-span ' + (index == currentSwiper ? 'current' : '')
                    }
                  ></Span>
                </Block>
              )
            })}
          </View>
        )}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
