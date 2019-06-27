import { Block, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// component/narbar/index.js
import util from '../../utils/util.js'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    navbar_options: [
      {
        name: '1',
        value: '选项1'
      },
      {
        name: '2',
        value: '选项2'
      },
      {
        name: '3',
        value: '选项3'
      }
    ]
  }
  static options = {
    // 启用样式隔离，在自定义组件内外，使用 class 指定的样式将不会相互影响（一般情况下的默认值）
    styleIsolation: 'isolated'
  }
  _observeProps = []
  state = {
    default_navbar_value: '1'
  }
  handlerNavbarValueChange = e => {
    // 获取当前navbar状态
    let current_navbar_value = e.target.dataset.name
    // 获取data中navbar状态
    let { default_navbar_value } = this.data
    // 当前navbar状态和data中订单状态一致，直接return
    if (current_navbar_value === default_navbar_value) {
      return
    }
    // 打印日志-方便地主查看
    util.printLog('wechat_app', `navbar_value_${current_navbar_value}`, '')
    this.setData({
      // 设置当前navbar状态
      default_navbar_value: current_navbar_value
    })
    var myEventDetail = {
      current_navbar_value // detail对象，提供给事件监听函数
    }
    var myEventOption = {} // 触发事件的选项
    this.triggerEvent('handlerNavbarValueChange', myEventDetail, myEventOption)
  }
  config = {
    component: true
  }

  render() {
    const { navbar_options: navbar_options } = this.props
    const { default_navbar_value: default_navbar_value } = this.state
    return (
      <View className="navbar-content">
        {navbar_options.map((item, index) => {
          return (
            <View
              key={'navbar-' + index}
              className={
                'navbar-item ' +
                (default_navbar_value === item.name ? 'selected' : ' ')
              }
              data-value={item.value}
              data-name={item.name}
              onClick={this.handlerNavbarValueChange}
            >
              {item.value}
            </View>
          )
        })}
      </View>
    )
  }
}

export default _C
