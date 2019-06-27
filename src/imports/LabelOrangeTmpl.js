import { Block, View, Image, Text, Button, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class LabelOrangeTmpl extends Taro.Component {
  render() {
    const { data: value } = this.props
    return (
      <Block>
        <Text className="label-orange">{value}</Text>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
