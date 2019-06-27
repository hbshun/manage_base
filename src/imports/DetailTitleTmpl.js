import { Block, View, Text, Image, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class DetailTitleTmpl extends Taro.Component {
  render() {
    const { data: value } = this.props
    return (
      <Block>
        <View className="detail-action-title">
          <Text>{value}</Text>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
