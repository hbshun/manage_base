import { Block, View, Image, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class OrderStatusTmpl extends Taro.Component {
  render() {
    const { data: status } = this.props
    return (
      <Block>
        <View className="order-status">
          <I className="sparrow-icon icon-wait-for-pay order-status-background"></I>
          <View className="order-status-message">
            <View className="message1">
              <I className="sparrow-icon icon-wait-for-pay"></I>
              {status.statusText}
            </View>
            <View className="message2">
              <View className="text1">{status.textUp}</View>
              <View className="text2">{status.textDown}</View>
            </View>
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
