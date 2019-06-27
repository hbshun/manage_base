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
export default class ChooseDiscountsTmpl extends Taro.Component {
  render() {
    const {
      data: {
        coupons: coupons,
        pointShow: pointShow,
        couponShow: couponShow,
        index: index,
        itemIndex: itemIndex,
        item: item
      }
    } = this.props
    return (
      <Block>
        <View className="mask-in" onClick={this.closeChooseDiscounts}></View>
        <View className="choose-discounts">
          <View className="pink-hit">选择优惠</View>
          {coupons.coupons.map((item, index) => {
            return (
              <View className="discounts-info">
                {coupons.c_coupon && (
                  <View className="dis-line">
                    <View className="dis-item">
                      <View className="dis-avai">
                        <Text className="text-14">C券抵扣</Text>
                        <Text className="text-12">
                          {'可用C券：' + coupons.c_coupon.all}
                        </Text>
                        {/*  <i class="sparrow-icon {{coupons.c_coupon.used_amount?'icon-choose':'icon-not-choose'}}"></i>  */}
                      </View>
                      <View className="dis-use">
                        <Text className="text-12">使用C券：</Text>
                        <Input
                          className="dis-use-num"
                          type="number"
                          onInput={this.usePoint}
                          value={coupons.c_coupon.used_amount}
                          onFocus={this.pointFocus}
                          onBlur={this.pointBlur}
                        ></Input>
                        {pointShow && (
                          <View className="confirm-button">确定</View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
                {coupons.a_coupon && (
                  <View className="dis-line">
                    <View className="dis-item">
                      <View className="dis-avai">
                        <Text className="text-14">礼金抵扣</Text>
                        <Text className="text-12">
                          {'可用礼金：' + coupons.a_coupon.all}
                        </Text>
                        {/*  <i class="sparrow-icon {{ coupons.a_coupon.used_amount?'icon-choose':'icon-not-choose' }}"></i>  */}
                      </View>
                      <View className="dis-use">
                        <Text className="text-12">使用礼金：</Text>
                        <Input
                          className="dis-use-num"
                          type="number"
                          onInput={this.useACoupon}
                          value={coupons.a_coupon.used_amount}
                          onFocus={this.couponFocus}
                          onBlur={this.couponBlur}
                        ></Input>
                        {couponShow && (
                          <View className="confirm-button">确定</View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
                {coupons.coupons && (
                  <Block>
                    {coupons.coupons.map((item, itemIndex) => {
                      return (
                        <Block key={'coupons-item-' + index}>
                          <View
                            className="dis-line"
                            onClick={this.chooseCoupon}
                            data-index={itemIndex}
                          >
                            <View className="dis-item">
                              <View className="dis-avai">
                                <Text className="text-14">{item.title}</Text>
                                <Text className="text-12"></Text>
                                <I
                                  className={
                                    'sparrow-icon ' +
                                    (item.checked
                                      ? 'icon-choose'
                                      : 'icon-not-choose')
                                  }
                                ></I>
                              </View>
                            </View>
                          </View>
                        </Block>
                      )
                    })}
                  </Block>
                )}
              </View>
            )
          })}
          <View className="red-hit" onClick={this.clickConfirmDiscount}>
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
