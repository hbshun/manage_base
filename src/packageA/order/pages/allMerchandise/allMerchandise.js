import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../../utils/util.js'
import orderProduct from '../../../../component/orderProduct/orderProduct.js'

// 展示所有的商品
import OrderProductTmpl from '../../../../imports/OrderProductTmpl.js'
import './allMerchandise.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const length = wx.globalData.proGiftLength
    const allProGiftList = wx.globalData.allProGiftList

    console.log(wx.globalData)

    Taro.setNavigationBarTitle({
      title: length + '件商品'
    })

    this.setData({
      allProGiftList: allProGiftList,
      proGiftListLength: length
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 关闭当前页面
   */
  closePage: function() {
    Taro.navigateBack({
      delta: 1
    })
  }
}

const assignedObject = util.assignObject(pageData, orderProduct)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    enablePullDownRefresh: false
  }

  render() {
    const {
      allProGiftList: allProGiftList,
      proGiftListLength: proGiftListLength
    } = this.state
    return (
      <View className="all-merchandise">
        <OrderProductTmpl
          data={{
            proGift: allProGiftList
          }}
        ></OrderProductTmpl>
        <View className="no-more-merchandise">
          {'共计' + proGiftListLength + '件商品'}
        </View>
        <View className="all-merchandise-return" onClick={this.closePage}>
          <I className="sparrow-icon icon-arrows-left"></I>
          <Text>返回</Text>
        </View>
      </View>
    )
  }
}

export default _C
