import ShopItembTmpl from './ShopItembTmpl'
import { Block, View, Image, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ProductListNewTmpl extends Taro.Component {
  render() {
    const {
      data: { brandProducts: brandProducts, index: index, idx: idx }
    } = this.props
    return (
      <Block>
        <View className="product-main">
          <View className="line-back"></View>
          {brandProducts.map((item, idx) => {
            return (
              <Block key={'show-product-data-' + index}>
                {idx % 2 == 0 ? (
                  <Block>
                    <ShopItembTmpl
                      data={{
                        '...item,isOddShop': 'isOddShop'
                      }}
                    ></ShopItembTmpl>
                  </Block>
                ) : (
                  <Block>
                    <ShopItembTmpl
                      data={{
                        '...item,isOddShop': ''
                      }}
                    ></ShopItembTmpl>
                  </Block>
                )}
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
