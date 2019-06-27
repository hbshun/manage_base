import PriceBoxTmpl from './PriceBoxTmpl'
import RedSmallSpanTmpl from './RedSmallSpanTmpl'
import ProductTitleTmpl from './ProductTitleTmpl'
import { Block, View, Icon, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ShopItembTmpl extends Taro.Component {
  render() {
    const {
      data: {
        isOddShop: isOddShop,
        id: id,
        img: img,
        sellOut: sellOut,
        title: title,
        activeArr: activeArr,
        index: index,
        item: item,
        originalPrice: originalPrice,
        newPrice: newPrice
      }
    } = this.props
    return (
      <Block>
        <View
          className={'shop-row ' + isOddShop}
          data-id={id}
          onClick={this.linkToProductInfo}
        >
          <View className="img-out">
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
          <View className="shop-list2-body">
            <ProductTitleTmpl
              data={{
                mainTitle: title
              }}
            ></ProductTitleTmpl>
            {/* 活动标签 */}
            <View className="promotion-view">
              {activeArr.map((item, index) => {
                return (
                  <Block key={'shop-item2-' + index}>
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
          </View>
          {/*  </view>  */}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
