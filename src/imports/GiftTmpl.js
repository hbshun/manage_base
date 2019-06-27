import LabelOrangeTmpl from './LabelOrangeTmpl'
import {
  Block,
  View,
  Image,
  Text,
  Form,
  Button,
  MovableArea,
  MovableView
} from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class GiftTmpl extends Taro.Component {
  render() {
    const {
      data: {
        selectedGift: selectedGift,
        item: item,
        index: index,
        chooseNum: chooseNum
      }
    } = this.props
    return (
      <Block>
        {selectedGift.promotion_type == 'FIXED_PRICE' ? (
          <Block>
            {selectedGift.giftArr.map((item, index) => {
              return (
                <Block key="selectedGift">
                  <View className="gift-item">
                    {item.chooseGift ? (
                      <View className="pro-choose">
                        {item.checked ? (
                          <Block>
                            <I
                              className="sparrow-icon icon-choose}}"
                              data-index={index}
                              onClick={this.chooseGift}
                            ></I>
                          </Block>
                        ) : (
                          <Block>
                            {selectedGift.chosenNum >= chooseNum ||
                            item.stock <= 0 ? (
                              <I className="sparrow-icon icon-disable"></I>
                            ) : (
                              <I
                                className="sparrow-icon icon-not-choose}}"
                                data-index={index}
                                onClick={this.chooseGift}
                              ></I>
                            )}
                            {/*  没选中的显示可选  */}
                          </Block>
                        )}
                      </View>
                    ) : (
                      <View className="gift-text">
                        <LabelOrangeTmpl
                          data={{
                            value: '换购'
                          }}
                        ></LabelOrangeTmpl>
                      </View>
                    )}
                    {/*  购物车里展示加价购页面  */}
                    <View className="gift-info">
                      <View className="gift-img">
                        <Image src={item.main_image}></Image>
                        {item.stock <= 0 && (
                          <Image className="sparrow-icon icon-sell-out"></Image>
                        )}
                      </View>
                      <View className="gift-detail">
                        <View className="gift-h3">
                          {item.product_main.title + item.sku_attr}
                        </View>
                        <View className="gift-h4">
                          {item.product_main.sub_title}
                        </View>
                        <View className="gift-price">
                          <View className="price-new">
                            ￥<Text>{item.retail_price}</Text>
                          </View>
                          {item.original_price - item.retail_price > 0 && (
                            <View className="price-old grey">
                              ￥<Text>{item.original_price}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </Block>
              )
            })}
          </Block>
        ) : selectedGift.promotion_type == 'GIFT' ? (
          <Block>
            {selectedGift.giftArr.map((item, index) => {
              return (
                <Block key="selectedGift">
                  <View className="gift-item">
                    {item.chooseGift ? (
                      <View className="pro-choose">
                        {item.checked ? (
                          <Block>
                            <I
                              className="sparrow-icon icon-choose}}"
                              data-index={index}
                              onClick={this.chooseGift}
                            ></I>
                          </Block>
                        ) : (
                          <Block>
                            {selectedGift.chosenNum >= chooseNum ||
                            item.stock < 1 ? (
                              <I className="sparrow-icon icon-disable"></I>
                            ) : (
                              <I
                                className="sparrow-icon icon-not-choose}}"
                                data-index={index}
                                onClick={this.chooseGift}
                              ></I>
                            )}
                            {/*  没选中的显示可选  */}
                          </Block>
                        )}
                      </View>
                    ) : (
                      <View className="gift-text">
                        <LabelOrangeTmpl
                          data={{
                            value: '赠品'
                          }}
                        ></LabelOrangeTmpl>
                      </View>
                    )}
                    {/*  购物车里展示赠品页面  */}
                    <View className="gift-info">
                      <View className="gift-img">
                        <Image src={item.image}></Image>
                        {item.stock < 1 && (
                          <Image className="sparrow-icon icon-no-more-gift"></Image>
                        )}
                      </View>
                      <View className="gift-detail">
                        <View className="gift-h3">{item.title}</View>
                        <View className="gift-h4"></View>
                        <View className="gift-price">
                          <View className="price-new">
                            ￥<Text>0.00</Text>
                          </View>
                          {item.price - 0 > 0 && (
                            <View className="price-old">
                              赠品价值￥<Text>{item.price}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </Block>
              )
            })}
          </Block>
        ) : (
          <Block>
            {selectedGift.giftArr.map((item, index) => {
              return (
                <Block key={'selectedGift-' + index}>
                  <View className="gift-item">
                    <View className="gift-info">
                      <View className="gift-img">
                        <Image src={item.image}></Image>
                      </View>
                      <View className="gift-detail">
                        <View className="gift-h3">{item.title}</View>
                      </View>
                    </View>
                  </View>
                </Block>
              )
            })}
          </Block>
        )}
        {/*  买赠  */}
        {/*  优惠券  */}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
