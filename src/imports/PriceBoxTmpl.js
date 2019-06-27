import { Block, View, Text, Image, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class PriceBoxTmpl extends Taro.Component {
  render() {
    const {
      data: { newPrice: newPrice, old: old }
    } = this.props
    return (
      <Block>
        <View className="price-box">
          <View className="price-selling">
            <Text className="i">￥</Text>
            {newPrice}
          </View>
          {old - newPrice > 0 && (
            <Block>
              <View className="price-original">
                <Text className="i">￥</Text>
                <Text className="em">{old}</Text>
              </View>
            </Block>
          )}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
