import { Block, View, Icon, Navigator, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './success.scss'

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
    navigationBarTitleText: '成功'
  }

  render() {
    return (
      <View className="page">
        <View className="weui-msg">
          <View className="weui-msg__icon-area">
            <Icon type="success" size="93"></Icon>
          </View>
          <View className="weui-msg__text-area">
            <View className="weui-msg__title">操作成功</View>
            <View className="weui-msg__desc">
              内容详情，可根据实际需要安排，如果换行则不超过规定长度，居中展现
              <Navigator url className="weui-msg__link">
                文字链接
              </Navigator>
            </View>
          </View>
          <View className="weui-msg__opr-area">
            <View className="weui-btn-area">
              <Button className="weui-btn" type="primary">
                推荐操作
              </Button>
              <Button className="weui-btn" type="default">
                辅助操作
              </Button>
            </View>
          </View>
          <View className="weui-msg__extra-area">
            <View className="weui-footer">
              <View className="weui-footer__links">
                <Navigator url className="weui-footer__link">
                  底部链接文本
                </Navigator>
              </View>
              <View className="weui-footer__text">
                Copyright © 2008-2016 weui.io
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
} // pages/success/success.js

export default _C
