import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class LabelRedTmpl extends Taro.Component {
  render() {
    const { data: value } = this.props
    return (
      <Block>
        <Text className="label-red">{value}</Text>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
