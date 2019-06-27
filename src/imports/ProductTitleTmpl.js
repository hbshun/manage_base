import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ProductTitleTmpl extends Taro.Component {
  render() {
    const { data: mainTitle } = this.props
    return (
      <Block>
        <View className="product-title">
          <View className="product-title-head">
            <Text className="h2">{mainTitle}</Text>
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
