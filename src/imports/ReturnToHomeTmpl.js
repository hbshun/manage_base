import { Block, View, Image, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ReturnToHomeTmpl extends Taro.Component {
  render() {
    return (
      <Block>
        {showReturnToHome && (
          <View className="return-home" onClick={this.returnToHome}>
            <I className="sparrow-icon icon-navigate-return"></I>
          </View>
        )}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
