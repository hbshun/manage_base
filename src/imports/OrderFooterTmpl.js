import { Block, View, Image, Input, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class OrderFooterTmpl extends Taro.Component {
  render() {
    return (
      <Block>
        <View className="weui-footer">
          <View className="weui-footer__text">北京汉光百货有限责任公司</View>
          <View className="weui-footer__text">
            Copyright © 2008-2016 hanguangbaihuo.com
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
