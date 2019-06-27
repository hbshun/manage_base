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
  config = {
    navigationBarTitleText: '会员权益'
  }

  render() {
    return <Text>积分兑换</Text>
  }
} // pages/usercenter/components/storeServices/components/userEquity/index.js

export default _C
