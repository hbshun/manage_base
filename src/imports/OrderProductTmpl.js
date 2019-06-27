import LabelOrangeTmpl from './LabelOrangeTmpl'
import { Block, View, Image, Text, Button, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class OrderProductTmpl extends Taro.Component {
  render() {
    const {
      data: { proGift: proGift, index: index, item: item }
    } = this.props
    return (
      <Block>
        <View className="order-product">
          {proGift.map((item, index) => {
            return (
              <Block key={'order-product-' + index}>
                <View className="counter-product">
                  <View className="counter-name">
                    <I className="sparrow-icon icon-shop"></I>
                    {item.brandName}
                  </View>
                  {item.proGift.map((proGift, index) => {
                    return (
                      <Block key="*this">
                        <View
                          className="product"
                          data-product-gift-id={proGift.productGiftId}
                          onClick={this.clickToProductDetail}
                        >
                          {proGift.promotion_type_name && (
                            <Block>
                              <View className="left-left">
                                <LabelOrangeTmpl
                                  data={{
                                    value: proGift.promotion_type_name
                                  }}
                                ></LabelOrangeTmpl>
                              </View>
                            </Block>
                          )}
                          <View className="left">
                            <Image src={proGift.main_image}></Image>
                          </View>
                          <View className="center">
                            <View className="product-name">
                              {proGift.title}
                            </View>
                            <View className="product-type">
                              {proGift.sku_attr}
                            </View>
                          </View>
                          <View className="right">
                            <View className="new-price">
                              {proGift.retail_price}
                            </View>
                            {proGift.original_price - proGift.retail_price >
                              0 && (
                              <View className="old-price">
                                {proGift.original_price}
                              </View>
                            )}
                            <View className="number">
                              {proGift.quantity ? 'x' + proGift.quantity : ''}
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
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
