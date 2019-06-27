import RedSmallSpanTmpl from './RedSmallSpanTmpl'
import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class BrandActivityTmpl extends Taro.Component {
  render() {
    const {
      data: { activity: activity, index: index, item: item }
    } = this.props
    return (
      <Block>
        <View className="brand-activity" id="brand-activity">
          <View className="weui-cell" onClick={this.handleShowDialogService}>
            <View className="weui-cell__hd service-left">服务</View>
            <View className="weui-cell__bd">
              <View className="service-item">
                <I className="sparrow-icon icon-product-service"></I>
                <Text>正品保障</Text>
              </View>
              <View className="service-item">
                <I className="sparrow-icon icon-product-service"></I>
                <Text>无忧售后</Text>
              </View>
              <View className="service-item">
                <I className="sparrow-icon icon-product-service"></I>
                <Text>极速退款</Text>
              </View>
              <View className="service-item">
                <I className="sparrow-icon icon-service-warning"></I>
                <Text>退换货特别提示</Text>
              </View>
            </View>
            {/*  <view class="weui-cell__ft weui-cell__ft_in-access "></view>  */}
            <I className="sparrow-icon icon-enter def-icon"></I>
          </View>
          {activity.promotion_name.length > 0 && (
            <View
              className="weui-cell"
              onClick={this.activity_showActivityDesc}
            >
              <View className="weui-cell__hd activity-left">活动</View>
              <View className="weui-cell__bd">
                {activity.promotion_name.map((item, index) => {
                  return (
                    <Block
                      key={'promotion-name-' + index}
                      className="activity-pad"
                    >
                      <RedSmallSpanTmpl
                        data={{
                          content: item
                        }}
                      ></RedSmallSpanTmpl>
                    </Block>
                  )
                })}
              </View>
              <I className="sparrow-icon icon-enter def-icon"></I>
            </View>
          )}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
