import ChooseSpanTmpl from './ChooseSpanTmpl'
import { Block, View, Icon, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ChooseFeatureTmpl extends Taro.Component {
  render() {
    const {
      data: { arr: arr, index: index, arrItem: arrItem, canShare: canShare }
    } = this.props
    return (
      <Block>
        <View className="popup-property-box">
          <View className="popup-property-part">
            {arr.map((arrItem, index) => {
              return (
                <Block key={'choose-feature-' + index}>
                  {arrItem.values.length > 0 && (
                    <ChooseSpanTmpl
                      data={{
                        '...arrItem, canShare': canShare
                      }}
                    ></ChooseSpanTmpl>
                  )}
                </Block>
              )
            })}
          </View>
          {/*  <view class="weui-flex">
                           <view class="weui-flex__item">
                             <view class="placeholder choose-reset" bindtap="resetChoose">重置</view>
                           </view>
                           <view class="weui-flex__item">
                             <view class="placeholder choose-confirm" bindtap="confirmChoose">确定</view>
                           </view> 
                         </view>  */}
          <View className="choose-btn-fixed">
            <View className="choose-reset" onClick={this.resetChoose}>
              重置
            </View>
            <View className="choose-confirm" onClick={this.confirmChoose}>
              确定
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
