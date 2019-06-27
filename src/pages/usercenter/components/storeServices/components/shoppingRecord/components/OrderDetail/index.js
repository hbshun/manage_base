import { Block, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {}
  componentWillMount = (options = this.$router.params || {}) => {}
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  config = {}

  render() {
    return (
      <Text>
        pages/usercenter/components/storeServices/components/shoppingRecord/components/OrderDetail/index.wxml
      </Text>
    )
  }
} // pages/usercenter/components/storeServices/components/shoppingRecord/components/OrderDetail/index.js

export default _C
