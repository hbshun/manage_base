import { Block, View, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ListTmpl extends Taro.Component {
  render() {
    const { data: item } = this.props
    return (
      <Block>
        <Navigator
          url={item.redirectUrl}
          className="weui-cell weui-cell_access"
          hoverClass="weui-cell_active"
        >
          <View className="weui-cell__bd">{item.name}</View>
          <View className="weui-cell__ft weui-cell__ft_in-access"></View>
        </Navigator>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
