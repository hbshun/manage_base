import LabelOrangeTmpl from './LabelOrangeTmpl'
import { Block, View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class BrandTmpl extends Taro.Component {
  render() {
    const {
      data: { logo: logo, name: name, address: address }
    } = this.props
    return (
      <Block>
        <View className="brand-box">
          <View className="brand-head">
            <Image
              className="brand-head-logo"
              src={logo}
              onClick={this.brand_navigateToMiniProgram}
            ></Image>
            <View
              className="brand-head-l"
              onClick={this.brand_navigateToMiniProgram}
            >
              <View className="brand-head-title">
                <Text className="title">{name}</Text>
                <LabelOrangeTmpl
                  data={{
                    value: '专柜'
                  }}
                ></LabelOrangeTmpl>
              </View>
              <View className="brand-address">
                <I className="sparrow-icon icon-shop"></I>
                <Text>{'汉光百货·' + address}</Text>
              </View>
            </View>
            <View className="brand-head-r">
              <View
                className="brand-phone-view"
                onClick={this.brand_handleMakePhoneCall}
              >
                <I className="sparrow-icon icon-phone"></I>
              </View>
            </View>
          </View>
          {/* 关注 */}
          {/*  <view class="brand-middle clearfix">
                                                                                                                                                                                                                                                                                                                                                              <view class="brand-middle-l">
                                                                                                                                                                                                                                                                                                                                                                <text class="number">{{ rank }}</text>
                                                                                                                                                                                                                                                                                                                                                                <text class="text">关注度</text>
                                                                                                                                                                                                                                                                                                                                                              </view>
                                                                                                                                                                                                                                                                                                                                                              <view class="brand-middle-r">
                                                                                                                                                                                                                                                                                                                                                                <text class="number">{{ quantity }}</text>
                                                                                                                                                                                                                                                                                                                                                                <text class="text">全部商品</text>
                                                                                                                                                                                                                                                                                                                                                              </view>
                                                                                                                                                                                                                                                                                                                                                            </view>   */}
          {/* 按钮 */}
          {/*  <view class="brand-bottom clearfix">
                                                                                                                                                                                                                                                                                                                                                                                           <button class="weui-btn brand-button">
                                                                                                                                                                                                                                                                                                                                                                                            <i class="sparrow-icon icon-heart" />收藏专柜</button> 
                                                                                                                                                                                                                                                                                                                                                                                          <button class="weui-btn brand-button" bindtap="brand_navigateToMiniProgram">
                                                                                                                                                                                                                                                                                                                                                                                            <i class="sparrow-icon icon-enter-shop" />进入专柜</button>
                                                                                                                                                                                                                                                                                                                                                                                          <button class="weui-btn brand-button" bindtap="brand_handleMakePhoneCall">
                                                                                                                                                                                                                                                                                                                                                                                            <i class="sparrow-icon icon-phone" />联系专柜</button>
                                                                                                                                                                                                                                                                                                                                                                                        </view>  */}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
