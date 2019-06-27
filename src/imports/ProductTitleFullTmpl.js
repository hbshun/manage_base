import { Block, View, Text, Image, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ProductTitleFullTmpl extends Taro.Component {
  render() {
    const {
      data: { mainTitle: mainTitle, isCollect: isCollect, subtitle: subtitle }
    } = this.props
    return (
      <Block>
        <View className="product-title-full">
          <View className="product-title-main">
            <View className="product-title-maintitle">
              <Text>{mainTitle}</Text>
            </View>
            {isCollect && (
              <View className="product-title-collect">
                <I className="sparrow-icon icon-star2"></I>
                <Text>收藏</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <View className="product-title-subhead">
              <Text>{subtitle}</Text>
            </View>
          )}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
