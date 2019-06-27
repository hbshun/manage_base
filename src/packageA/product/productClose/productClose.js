import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../utils/util.js'

import './productClose.scss'
const productClosePage = {
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 点击去挑商品
   */
  goToProductList: function() {
    Taro.redirectTo({
      url: '/packageA/product/list/list?from_sold_out=1'
    })
  }
}

const assignedObject = util.assignObject(productClosePage)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '此商品已下架'
  }

  render() {
    return (
      <View className="cart-empty">
        <View className="circle-grey">
          <Image
            src={require('../../../image/productClose/product-close.png')}
          ></Image>
        </View>
        <View className="cart-hint">查看的商品已下架</View>
        <View className="select-button" onClick={this.goToProductList}>
          看看其他
        </View>
        {/*  <template is="returnToHome" data="{{ showReturnToHome: showReturnToHome }}"></template>  */}
      </View>
    )
  }
}

export default _C
