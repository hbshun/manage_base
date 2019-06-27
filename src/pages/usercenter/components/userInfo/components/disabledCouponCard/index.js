import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/components/userInfo/components/disabledCouponCard/index.js
import util from '../../../../../../utils/util.js'
import DialogModel from '../../../../../../component/dialogModel/index'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  static defaultProps = {
    coupon_info: {},
    type: ''
  }
  _observeProps = []
  state = {
    show_conpou_remark: false
  }
  openConpouRemarkVisible = () => {
    let code = this.properties.coupon_info.conpou_code
    let qrcodeUrl = util.createWxQrcode(code, 520)
    this.setData({
      show_conpou_remark: true,
      qrcodeUrl
    })
  }
  closeConpouRemarkVisible = () => {
    // 生成一个无效的一个条形码
    let qrcodeUrl = util.createWxQrcode('0000000000', 520)
    this.setData({
      show_conpou_remark: false,
      qrcodeUrl
    })
  }
  config = {
    component: true
  }

  render() {
    const { coupon_info: coupon_info, type: type } = this.props
    const {
      show_conpou_remark: show_conpou_remark,
      qrcodeUrl: qrcodeUrl
    } = this.state
    return (
      <Block>
        <View className="coupon-card" onClick={this.openConpouRemarkVisible}>
          <View className="coupon-item1 left-color left-radius"></View>
          <View className="coupon-item22 coupon-info">
            <View className="coupon-name">
              <View className="coupon-item2">{coupon_info.conpou_title}</View>
              {/*  <view class='coupon-item1 tooltips-content'>
                                                                                                                                                                                                                                                                                                       <view class='tooltips'>即将过期</view>
                                                                                                                                                                                                                                                                                                     </view>  */}
            </View>
            <View className="coupon-detail">
              <View className="coupon-item1">
                <View className="usage-restriction">
                  {coupon_info.conpou_name}
                </View>
                <View className="usage-date">
                  {coupon_info.start_time + ' - ' + coupon_info.end_time}
                </View>
              </View>
              <View className="value coupon-item1">
                <View className="coupon-item1 coupon-value">
                  <Text className="symbol">￥</Text>
                  {coupon_info.conpou_value}
                </View>
                <View>
                  <View className="coupon-item1 coupon-to-use">
                    {type === 'used_coupon_list'
                      ? '已使用'
                      : type === 'expired_coupon_list'
                      ? '已过期'
                      : ''}
                  </View>
                </View>
              </View>
            </View>
            <View className="coupon-tips">
              <View className="coupon-item1">{coupon_info.coupon_remark}</View>
              <View className="coupon-item1 text-right">查看详情</View>
            </View>
          </View>
          <View className="coupon-item1 right-radius"></View>
        </View>
        <DialogModel
          onMyevent={this.closeConpouRemarkVisible}
          showDialogService={show_conpou_remark}
        >
          <View
            className="content"
            style="width:100%;position: fixed;bottom: 0;z-index: 2001;background-color: #fff;border-radius: 20rpx 20rpx 0 0;"
          >
            <View className="title-content">
              <View className="title-left"></View>
              <View className="title-value">适用范围</View>
              <View className="title-right">
                <View
                  className="grid-icon sparrow-icon icon-close icon"
                  onClick={this.closeConpouRemarkVisible}
                ></View>
              </View>
            </View>
            <View className="slot-content">
              <Text>{coupon_info.coupon_limitremark}</Text>
            </View>
            <View className="qrcode-content">
              <Image src={qrcodeUrl}></Image>
            </View>
          </View>
        </DialogModel>
      </Block>
    )
  }
}

export default _C
