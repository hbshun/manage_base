import PriceBoxTmpl from './PriceBoxTmpl'
import RedSmallSpanTmpl from './RedSmallSpanTmpl'
import ProductTitleTmpl from './ProductTitleTmpl'
import { Block, View, Icon, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ShopItemaTmpl extends Taro.Component {
  render() {
    const {
      data: {
        id: id,
        img: img,
        sellOut: sellOut,
        title: title,
        activeArr: activeArr,
        index: index,
        item: item,
        originalPrice: originalPrice,
        newPrice: newPrice,
        isActivity: isActivity
      }
    } = this.props
    return (
      <Block>
        <View className="shopItem">
          <View
            className="shopImg"
            data-id={id}
            onClick={this.linkToProductInfo}
          >
            <Image
              lazyLoad="true"
              className="shop-img"
              alt="商品图"
              mode="aspectFit"
              src={img}
            ></Image>
            {sellOut && (
              <Image
                lazyLoad="true"
                src
                className="sparrow-icon icon-sell-out"
              ></Image>
            )}
          </View>
          <View
            className="shopMessage"
            data-id={id}
            onClick={this.linkToProductInfo}
          >
            <ProductTitleTmpl
              data={{
                mainTitle: title
              }}
            ></ProductTitleTmpl>
            {/* 活动标签 */}
            <View style="height: 28px; line-height: 28px; overflow: hidden">
              {activeArr.map((item, index) => {
                return (
                  <Block key={'shop-item1-' + index}>
                    <RedSmallSpanTmpl
                      data={{
                        content: item
                      }}
                    ></RedSmallSpanTmpl>
                  </Block>
                )
              })}
            </View>
            {/* price插件 */}
            <PriceBoxTmpl
              data={{
                old: (originalPrice, newPrice)
              }}
            ></PriceBoxTmpl>
            {isActivity && (
              <Block>
                {sellOut ? (
                  <View className="add-to-cart cart-sell-out">
                    <I className="sparrow-icon icon-add-to-cart"></I>
                  </View>
                ) : (
                  <View
                    className="add-to-cart"
                    onClick={this.addToCart}
                    data-id={id}
                  >
                    <I className="sparrow-icon icon-add-to-cart"></I>
                  </View>
                )}
              </Block>
            )}
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
