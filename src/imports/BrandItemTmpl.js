import GiftTmpl from './GiftTmpl'
import ProductTmpl from './ProductTmpl'
import ActivityTmpl from './ActivityTmpl'
import {
  Block,
  View,
  Image,
  Text,
  Form,
  Button,
  MovableArea,
  MovableView
} from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class BrandItemTmpl extends Taro.Component {
  render() {
    const {
      data: {
        brand: brand,
        brandIndex: brandIndex,
        deleteWidth: deleteWidth,
        item: item,
        index: index,
        movableViewWidth: movableViewWidth
      }
    } = this.props
    return (
      <Block>
        <View className={'brand-item ' + (brand.type ? 'wholeActivity' : '')}>
          <View className="brand-title">
            <View className="weui-cell activity-box">
              <View className="weui-cell__bd">
                <View className="activity-title">
                  {brand.checked == 2 ? (
                    <View
                      className="brand-title-l"
                      data-brand-index={brandIndex}
                    >
                      <I className="sparrow-icon icon-disable"></I>
                    </View>
                  ) : (
                    <View
                      className="brand-title-l"
                      data-brand-index={brandIndex}
                      onClick={this.brandAllChooseStatus}
                    >
                      <I
                        className={
                          'sparrow-icon ' +
                          (brand.checked == 1
                            ? 'icon-choose'
                            : 'icon-not-choose')
                        }
                      ></I>
                    </View>
                  )}
                  <View
                    className="activity-title-r"
                    data-id={brand.id}
                    onClick={this.turnToBrand}
                  >
                    <I className="sparrow-icon icon-shop"></I>
                    <Text className="brand-title-name">{brand.name}</Text>
                  </View>
                </View>
              </View>
              {/*  这里记得跳到专柜页面  */}
              <View
                className="weui-cell__ft weui-cell__ft_in-access"
                data-id={brand.id}
                onClick={this.turnToBrand}
              ></View>
            </View>
          </View>
          <View className="brand-active">
            <ActivityTmpl
              data={{
                promotions: brand.activity
              }}
            ></ActivityTmpl>
          </View>
          {/*  <view class="border-l-10"></view>  */}
          <View className="brand-product">
            <View className="just-product">
              {brand.products.map((item, index) => {
                return (
                  <Block key="brandProducts">
                    <MovableArea className="product-movable-area">
                      <View
                        style={'width: ' + deleteWidth}
                        className="delet-product-item"
                        data-id={item.id}
                        onClick={this.deleteSoldOutProd}
                      >
                        删除
                      </View>
                      <MovableView
                        data-brand-index={brandIndex}
                        data-product-index={index}
                        x={item.x}
                        onChange={this.movableChange}
                        onTouchStart={this.startMovableTouch}
                        onTouchEnd={this.movableTouchEnd}
                        outOfBounds="true"
                        inertia="true"
                        damping="100"
                        friction="4"
                        style={'width:' + movableViewWidth}
                        className="product-movable-item"
                        direction="horizontal"
                      >
                        <ProductTmpl
                          data={{
                            item: (item, brandIndex)
                          }}
                        ></ProductTmpl>
                      </MovableView>
                    </MovableArea>
                  </Block>
                )
              })}
            </View>
            <View className="gift-product">
              {brand.gift.map((item, index) => {
                return (
                  <Block key="brandGift">
                    <GiftTmpl
                      data={{
                        selectedGift: item
                      }}
                    ></GiftTmpl>
                  </Block>
                )
              })}
            </View>
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
