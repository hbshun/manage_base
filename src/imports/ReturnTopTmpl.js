import { Block, View, Image, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ReturnTopTmpl extends Taro.Component {
  render() {
    return (
      <Block>
        {showReturnTop && (
          <View className="return-top" onClick={this.returnTop}>
            <I className="sparrow-icon icon-return-top"></I>
          </View>
        )}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
