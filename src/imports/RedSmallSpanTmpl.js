import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class RedSmallSpanTmpl extends Taro.Component {
  render() {
    const { data: content } = this.props
    return (
      <Block>
        <Text className="red-small-span">{content}</Text>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
