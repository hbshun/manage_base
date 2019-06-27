import { Block, View, Navigator, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class DetailTmpl extends Taro.Component {
  render() {
    const { data: item } = this.props
    return (
      <Block>
        <View className="help-item" hoverClass="no">
          <View className="help-q">{item.title}</View>
          <View className="help-a">{item.desc}</View>
          <View className="help-a-detail">
            <RichText nodes={item.content}></RichText>
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
