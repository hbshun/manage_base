import ShopItembTmpl from './ShopItembTmpl'
import { Block, ScrollView, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class DisplayProductDefaultTmpl extends Taro.Component {
  render() {
    const {
      data: { row: row, index: index, idx: idx }
    } = this.props
    return (
      <Block>
        <View className="sku-list" id="product-detail-top">
          {row.item.map((item, idx) => {
            return (
              <Block key={'show-product-data-' + index}>
                {idx % 2 == 0 ? (
                  <Block>
                    <ShopItembTmpl
                      data={{
                        '...gridsData[item],isOddShop': 'isOddShop'
                      }}
                    ></ShopItembTmpl>
                  </Block>
                ) : (
                  <Block>
                    <ShopItembTmpl
                      data={{
                        '...gridsData[item],isOddShop': ''
                      }}
                    ></ShopItembTmpl>
                  </Block>
                )}
              </Block>
            )
          })}
          {/*  <template is="returnTop" data="{{ showReturnTop }}"></template>  */}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
