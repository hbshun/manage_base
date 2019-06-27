import {
  Block,
  View,
  Text,
  Textarea,
  Button,
  Image,
  Input
} from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ChooseExpressTmpl extends Taro.Component {
  render() {
    const {
      data: { shipping: shipping, item: item, shippingType: shippingType }
    } = this.props
    return (
      <Block>
        <View className="mask-in" onClick={this.closeChooseExpress}></View>
        <View className="choose-express">
          <View className="pink-hit">选择配送方式</View>
          <View className="express-info">
            {shipping.map((item, index) => {
              return (
                <Block key="shipping-item">
                  <View
                    className="exp-line"
                    data-shipping-type={item.shipping_type}
                    onClick={this.chooseExpress}
                  >
                    <View className="exp-item">
                      <View className="exp-avai">
                        <Text className="text-14">{item.shipping_name}</Text>
                        {/*  <text wx:if="{{item.shipping_type == 'express'}}" class="text-12">￥{{postage}}</text>  */}
                        <I
                          className={
                            'sparrow-icon ' +
                            (shippingType == item.shipping_type
                              ? 'icon-choose'
                              : 'icon-not-choose')
                          }
                        ></I>
                      </View>
                      {item.shipping_type == 'self_service' && (
                        <View>
                          <View className="self-help-addr">
                            自提位置：汉光百货北侧电梯上10层前台
                          </View>
                          <View className="self-help-time">
                            自提时间：成功支付后客服人员将联系您确定到店提货时间
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </Block>
              )
            })}
          </View>
          <View className="red-hit" onClick={this.closeChooseExpress}>
            确定
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
