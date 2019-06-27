import LabelRedTmpl from './LabelRedTmpl'
import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class PromotionInfoTmpl extends Taro.Component {
  render() {
    const {
      data: {
        otherInfo: otherInfo,
        promotionLevel: promotionLevel,
        index: index,
        levelItem: levelItem,
        giftItem: giftItem,
        note: note,
        item: item
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
              <View className="promotion-item">
                {otherInfo.days ? (
                  <View className="promotion-time">
                    <I className="sparrow-icon icon-count-down"></I>
                    距结束时间还有：
                    <Span className="red">{otherInfo.days}</Span>天
                  </View>
                ) : otherInfo.text ? (
                  <View className="promotion-time">
                    <I className="sparrow-icon icon-count-down"></I>
                    {otherInfo.text}
                  </View>
                ) : (
                  <View className="promotion-time">
                    <I className="sparrow-icon icon-count-down"></I>
                    距结束时间还有：
                    <Span className="red">{otherInfo.hours}</Span>小时
                    <Span className="red">{otherInfo.minutes}</Span>分
                    <Span className="red">{otherInfo.seconds}</Span>秒
                  </View>
                )}
                {promotionLevel.map((levelItem, index) => {
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
                                  <View className="font-size-16">详情</View>
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
              </View>
              {note.length > 0 && (
                <View className="promotion-regulation">
                  {note.map((item, index) => {
                    return (
                      <View
                        key={'promotion-key-' + index}
                        className="regulation-view"
                      >
                        <Span className="red">·</Span>
                        {item}
                      </View>
                    )
                  })}
                </View>
              )}
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
