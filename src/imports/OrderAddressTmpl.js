import { Block, View, Image, Text, Button, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class OrderAddressTmpl extends Taro.Component {
  render() {
    const { data: address } = this.props
    return (
      <Block>
        <View className="weui-panel__bd order-trace">
          <Navigator
            url="/"
            className="weui-media-box weui-media-box_appmsg order-trace-box"
          >
            <View className="weui-media-box__hd weui-media-box__hd_in-appmsg order-trace-icon">
              <I className="sparrow-icon icon-address"></I>
            </View>
            <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
              <View className="weui-media-box__title order-trace-title">
                <Text className="name">{address.name}</Text>
                <Text className="number">{address.phone}</Text>
              </View>
              <View className="weui-media-box__desc order-trace-desc">
                {'邮寄地址：' +
                  (address.province +
                    address.city +
                    address.district +
                    address.detail)}
              </View>
            </View>
          </Navigator>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
