import { Block, View, Text, Image, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class PropertyTmpl extends Taro.Component {
  render() {
    const {
      data: {
        attrs: attrs,
        index: index,
        item: item,
        briefDescription: briefDescription
      }
    } = this.props
    return (
      <Block>
        <View className="property">
          <View className="property-box">
            {attrs.map((item, index) => {
              return (
                <View
                  className="property-item clearfix"
                  key={'product-detail-property-' + index}
                >
                  <View className="property-item-l">{item.name}</View>
                  <View className="property-item-r">
                    <RichText nodes={item.value}></RichText>
                  </View>
                </View>
              )
            })}
            {briefDescription && (
              <View className="property-item clearfix">
                <View className="property-item-l">商品简介</View>
                <View className="property-item-r">
                  <RichText nodes={briefDescription}></RichText>
                </View>
              </View>
            )}
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
