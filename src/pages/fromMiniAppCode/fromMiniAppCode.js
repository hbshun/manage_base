import { Block } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './fromMiniAppCode.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {}
  componentWillMount = (options = this.$router.params || {}) => {
    if (options && options.scene) {
      const scene = decodeURIComponent(options.scene)

      let parameterArr = scene.split('_')

      if (parameterArr[0] == 'topic' && parameterArr.length == 3) {
        // 此页面跳转到专题页规则为： scene = topic_专题Id_传的参数（用于特殊识别来源）
        // 如：scene = topic_482_ceshi

        const url =
          'topic=' + parameterArr[1] + '&share_param=' + parameterArr[2]

        Taro.redirectTo({
          url: '/packageA/topic/topic?from_share=1&' + url
        })
      } else if (parameterArr[0] == 'product' && parameterArr.length == 3) {
        // 此页面跳转到商品详情页（非闪购）规则为： scene = product_商品id_传的参数（用于特殊识别来源）
        // 如：scene = product_425_ceshi

        const url = 'id=' + parameterArr[1] + '&share_param=' + parameterArr[2]
        Taro.redirectTo({
          url: '/packageA/product/detail/detail?' + url
        })
      } else {
        // 解析不正确直接跳到首页

        Taro.switchTab({
          url: '/pages/index/index'
        })
      }
    }
  }
  config = {
    navigationBarTitleText: ''
  }

  render() {
    return <Block></Block>
  }
} // 该页面用做扫非首页的小程序码跳转中间

export default _C
