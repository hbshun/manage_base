import {
  Block,
  View,
  Text,
  Image,
  RichText,
  ScrollView
} from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ScrollViewcMoreTmpl extends Taro.Component {
  render() {
    const {
      data: {
        productData: productData,
        index: index,
        item: item,
        activeIndex: activeIndex,
        activeArr: activeArr
      }
    } = this.props
    return (
      <Block>
        <View
          className="scroll-item scroll-view-3-more"
          style="background-color:'';"
        >
          <ScrollView className="scroll-view_H height-400" scrollX="true">
            {productData.map((item, index) => {
              return (
                <View
                  data-index={index}
                  key={'fresh-data-' + index}
                  className="product-data-item"
                  data-id={item.id}
                  onClick={this.linkToProductInfo}
                >
                  <View className="brand-prod-img">
                    <Image lazyLoad="true" src={item.img}></Image>
                    {item.sellOut && (
                      <Image
                        lazyLoad="true"
                        src
                        className="sparrow-icon icon-sell-out"
                      ></Image>
                    )}
                  </View>
                  <View className="brand-product-text">
                    <Text>{item.title}</Text>
                  </View>
                  <View className="brand-product-price-text">
                    <Span className="new-price">{'￥' + item.retailPrice}</Span>
                    {item.originalPrice - item.retailPrice > 0 && (
                      <Span className="old-price">
                        {'￥' + item.originalPrice}
                      </Span>
                    )}
                  </View>
                  <View className="discount-span">
                    {item.activeArr.length > 0 ? (
                      <Block>
                        {item.activeArr.map((activeArr, activeIndex) => {
                          return (
                            <Span
                              key={'brand-pro-active-' + activeIndex}
                              className="product-red-small-span"
                            >
                              {activeArr}
                            </Span>
                          )
                        })}
                      </Block>
                    ) : (
                      <Block>
                        <Span className="transparent-product-red-small-span">
                          1
                        </Span>
                      </Block>
                    )}
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
