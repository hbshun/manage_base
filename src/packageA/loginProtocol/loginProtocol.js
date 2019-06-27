import { Block, View, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// packageA/loginProtocol/loginProtocol.js
import util from '../../utils/util.js'
import constant from '../../config/constant.js'

import './loginProtocol.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    protocolContent: ''
  }
  componentDidShow = options => {
    const _this = this
    util.request({
      url: constant.loginProtocol,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        _this.setData({
          protocolContent: res.content
        })
      }
    })
  }
  config = {
    enablePullDownRefresh: false,
    navigationBarTitleText: '汉光百货+用户注册协议'
  }

  render() {
    const { protocolContent: protocolContent } = this.state
    return (
      <View className="protocol-out">
        <RichText className nodes={protocolContent}></RichText>
      </View>
    )
  }
}

export default _C
