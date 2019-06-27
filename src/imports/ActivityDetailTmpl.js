import LabelRedTmpl from './LabelRedTmpl'
import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ActivityDetailTmpl extends Taro.Component {
  render() {
    const {
      data: {
        all_promotion: all_promotion,
        index: index,
        item: item,
        levelItem: levelItem,
        giftItem: giftItem
      }
    } = this.props
    return (
      <Block>
        <View>
          <View className="promotion-mask"></View>
          <View className="promotions-list">
            <View className="promotion-title">
              <Span>活动详情</Span>
              <I
                className="sparrow-icon icon-close"
                onClick={this.closePromotionInfo}
              ></I>
            </View>
            <View className="promotion-body">
              {all_promotion.map((item, index) => {
                return (
                  <Block key={'test-' + index}>
                    <View className="promotion-item">
                      <View className="promotion-time">
                        <I className="sparrow-icon icon-count-down"></I>
                        活动结束时间：
                        <Span className="red">{item.endTime}</Span>
                      </View>
                      {item.promotionLevel.map((levelItem, index) => {
                        return (
                          <Block key={'promotion-level-' + index}>
                            <View className="promotion-level">
                              <View className="promotion-level-title">
                                <LabelRedTmpl
                                  data={{
                                    value: levelItem.typeName
                                  }}
                                ></LabelRedTmpl>
                                <Span className="label-description">
                                  {levelItem.levelDesc}
                                </Span>
                              </View>
                              {levelItem.gift.map((giftItem, index) => {
                                return (
                                  <Block key={'level-item-gift-' + index}>
                                    <View className="promotion-level-body">
                                      <View className="level-left">
                                        <Image
                                          lazyLoad="true"
                                          src={giftItem.image}
                                        ></Image>
                                        {giftItem.original_price ? (
                                          <Block>
                                            <View className="left-price">
                                              <Span className="prict-text">
                                                换购价
                                              </Span>
                                              <Span className="prict-num">
                                                {'￥' + giftItem.price}
                                              </Span>
                                            </View>
                                            <View className="left-price-original">
                                              <Span>原价：</Span>
                                              <Span className="price-elide">
                                                {'￥' + giftItem.original_price}
                                              </Span>
                                            </View>
                                          </Block>
                                        ) : (
                                          <Block>
                                            {giftItem.price - 0 > 0 && (
                                              <View className="left-price">
                                                <Span className="prict-text">
                                                  价值
                                                </Span>
                                                <Span className="prict-num">
                                                  {'￥' + giftItem.price}
                                                </Span>
                                              </View>
                                            )}
                                          </Block>
                                        )}
                                      </View>
                                      <View className="level-right">
                                        <View className="font-size-16">
                                          详情
                                        </View>
                                        <View className="font-size-12">
                                          {giftItem.description}
                                        </View>
                                      </View>
                                    </View>
                                  </Block>
                                )
                              })}
                            </View>
                          </Block>
                        )
                      })}
                      {item.note.length > 0 && (
                        <View className="promotion-regulation">
                          {item.note.map((item, index) => {
                            return (
                              <View
                                className="regulation-view"
                                key={'note-item-' + index}
                              >
                                {item && (
                                  <Block>
                                    <Span className="red">·</Span>
                                    {item}
                                  </Block>
                                )}
                              </View>
                            )
                          })}
                        </View>
                      )}
                    </View>
                  </Block>
                )
              })}
            </View>
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
