import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    title: '标题',
    showDialogService: false
  }
  _observeProps = []
  state = {}
  closeShowDialogServiceChange = () => {
    const myEventDetail = {} // detail对象，提供给事件监听函数
    const myEventOption = {} // 触发事件的选项
    this.triggerEvent('myevent', myEventDetail, myEventOption)
  }
  config = {
    component: true
  }

  render() {
    const { title: title, showDialogService: showDialogService } = this.props
    const {} = this.state
    return (
      showDialogService && (
        <View className="dialog-service">
          <View
            className="dialog-shade"
            onClick={this.closeShowDialogServiceChange}
          ></View>
          {this.props.children}
        </View>
      )
    )
  }
} // component/dialogModel/index.js

export default _C
