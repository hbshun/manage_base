import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import promotionInfo from '../../../component/promotionInfo/promotionInfo.js'

import PromotionInfoTmpl from '../../../imports/PromotionInfoTmpl.js'
import LabelRedTmpl from '../../../imports/LabelRedTmpl.js'
import './modifyPromotions.scss'
const modifyPromotions = {
  /**
   * 页面的初始数据
   */
  data: {
    productInfo: {}, // 产品内容，由购物车页面传入
    promotions: [], // 是否参加活动，由购物车页面传入，并且可在页面上点击勾选进行更改
    promotionsObj: {}, // 根据promotions处理的promotionsObj信息，key是活动id，控制页面内容的显示
    showPromInfo: false, // 是否展示活动详情
    timer: {}, //定时器
    promotionLevel: [] // 活动level的数组（点击查看活动详情时用到）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { productInfo, promotions } = wx.globalData
    const promotionsObj = this.setPromotionsObj(promotions)

    this.setData({
      productInfo,
      promotions,
      promotionsObj
    })

    console.log(this.data)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.closeTimer() //关掉查看活动详情里的定时器
  },

  /**
   * 设置根据promotions设置promotionsObj
   */
  setPromotionsObj: function(promotions) {
    let promotionsObj = {}

    // 为了拿到每个活动的checked的值建立一个for循环
    for (let i = 0; i < promotions.length; i++) {
      const id = promotions[i].id
      promotionsObj[id] = {}
      promotionsObj[id].disable = false // 初始化某活动都为 可选中 状态
      promotionsObj[id].checked = promotions[i].checked
    }

    // 完善promotionsObj
    for (let i = 0; i < promotions.length; i++) {
      const id1 = promotions[i].id
      for (let j = 0; j < promotions[i].excluded_promotionmain.length; j++) {
        // 先判断互斥的活动id是否已经被建立成key
        const id2 = promotions[i].excluded_promotionmain[j]

        if (promotionsObj[id1].checked) {
          // 如果id1被选中，id2变为不可选中
          promotionsObj[id2].disable = true
        }

        if (promotionsObj[id2].checked) {
          // 如果id2为选中状态，id1为不可选
          promotionsObj[id1].disable = true
        }
      }
    }

    return promotionsObj
  },

  /**
   * 根据点击选择/取消活动icon改变promotions
   */
  clickChoice: function(e) {
    const promIndex = e.currentTarget.dataset.index
    let promotions = this.data.promotions

    promotions[promIndex].checked = !promotions[promIndex].checked
    const promotionsObj = this.setPromotionsObj(promotions)
    this.setData({
      promotions,
      promotionsObj
    })
  },

  /**
   * 点击确定更改活动
   */
  clickConfirm: function(e) {
    let str = ''

    for (let key in this.data.promotionsObj) {
      if (this.data.promotionsObj[key].checked) {
        str += key + ','
      }
    }

    let data = {
      product_id: this.data.productInfo.id,
      promotionmain_ids: str.substring(0, str.length - 1)
    }

    util.request({
      url: constant.modifyPromotions,
      method: 'POST',
      data: data,
      success: function() {
        Taro.navigateBack({
          delta: 1
        })
      }
    })
  }
}

const assignedObject = util.assignObject(modifyPromotions, promotionInfo)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '活动修改',
    enablePullDownRefresh: false
  }

  render() {
    const {
      productInfo: productInfo,
      promotions: promotions,
      promotionsObj: promotionsObj,
      otherInfo: otherInfo,
      promotionLevel: promotionLevel,
      showPromInfo: showPromInfo
    } = this.state
    return (
      <View>
        <View className="pro-section1">
          <View className="pro-left">
            <Image src={productInfo.main_image}></Image>
          </View>
          <View className="pro-right">
            <View className="pro-name">{productInfo.title}</View>
            <View className="dec-name">{productInfo.sku_attr}</View>
            <View className="text-red">选择参加活动</View>
          </View>
        </View>
        <View className="promotions-body">
          {promotions.map((item, index) => {
            return (
              <View
                onClick
                data-id={item.id}
                className="weui-cell activity-box"
                key={'activity-' + index}
              >
                {promotionsObj[item.id].checked ? (
                  <Block>
                    <I
                      className="sparrow-icon icon-choose"
                      data-index={index}
                      onClick={this.clickChoice}
                    ></I>
                  </Block>
                ) : (
                  <Block>
                    {promotionsObj[item.id].disable ? (
                      <I
                        className="sparrow-icon icon-disable"
                        data-index={index}
                      ></I>
                    ) : (
                      <I
                        className="sparrow-icon icon-not-choose"
                        data-index={index}
                        onClick={this.clickChoice}
                      ></I>
                    )}
                  </Block>
                )}
                <View className="weui-cell__bd">
                  <View className="activity-title">
                    <View className="activity-title-l">
                      <LabelRedTmpl
                        data={{
                          value: item.promotionName
                        }}
                      ></LabelRedTmpl>
                    </View>
                    <View className="activity-title-r pl10">
                      <Text className="activity-title">{item.title}</Text>
                    </View>
                  </View>
                </View>
                <View
                  className="weui-cell__ft"
                  data-id={item.id}
                  onClick={this.turnToInfo}
                >
                  详情
                </View>
              </View>
            )
          })}
        </View>
        <View className="confirm" onClick={this.clickConfirm}>
          确定
        </View>
        {showPromInfo && (
          <Block>
            <PromotionInfoTmpl
              data={{
                otherInfo: (otherInfo, promotionLevel)
              }}
            ></PromotionInfoTmpl>
          </Block>
        )}
      </View>
    )
  }
}

export default _C
