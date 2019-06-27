import { Block, ScrollView, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class DisplayProductSwiperTmpl extends Taro.Component {
  render() {
    const {
      data: {
        row: row,
        index: index,
        gridsData: gridsData,
        item: item,
        activeIndex: activeIndex,
        activeArr: activeArr
      }
    } = this.props
    return (
      <Block>
        <View className="scroll-item">
          <ScrollView className="scroll-view_H height-400" scrollX="true">
            {row.item.map((item, index) => {
              return (
                <View
                  data-index={index}
                  key={'fresh-data-' + index}
                  className="product-data-item"
                  data-id={gridsData[item].id}
                  onClick={this.linkToProductInfo}
                >
                  <View className="brand-prod-img">
                    <Image src={gridsData[item].img}></Image>
                    {gridsData[item].sellOut && (
                      <Image src className="sparrow-icon icon-sell-out"></Image>
                    )}
                  </View>
                  <View className="brand-product-text">
                    <Text>{gridsData[item].title}</Text>
                  </View>
                  <View className="brand-product-text red-price">
                    {'￥' + gridsData[item].retailPrice}
                    {gridsData[item].originalPrice -
                      gridsData[item].retailPrice >
                      0 && (
                      <Span className="old-price">
                        {'￥' + gridsData[item].originalPrice}
                      </Span>
                    )}
                  </View>
                  <View className="discount-span">
                    {gridsData[item].activeArr.length > 0 ? (
                      <Block>
                        {gridsData[item].activeArr.map(
                          (activeArr, activeIndex) => {
                            return (
                              <Span
                                key={'brand-pro-active-' + activeIndex}
                                className="product-red-small-span"
                              >
                                {activeArr}
                              </Span>
                            )
                          }
                        )}
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
