import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// packageA/jumpBridge/jumpBridge.js
import jumpConfig from '../../config/jumpConfig.js'
import util from '../../utils/util.js'

import './jumpBridge.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {}
  componentWillMount = (options = this.$router.params || {}) => {
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    if (options.jump_type) {
      let url = jumpConfig[options.jump_type]

      url += util.returnUrl(options)
      // 记住 这里一定不是tabBar，tabBar不能用redirectTo转
      Taro.redirectTo({
        url: url
      })
    } else {
      Taro.switchTab({
        url: '/pages/index/index'
      })
    }
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  config = {}

  render() {
    return <View>
      Hello, World
    </View>
  }
}

export default _C
