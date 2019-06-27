import { Block, View, Picker, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  _observeProps = []
  state = {
    license_plate: '',
    province_codes: [
      '京',
      '津',
      '冀',
      '晋',
      '蒙',
      '辽',
      '吉',
      '黑',
      '沪',
      '苏',
      '浙',
      '皖',
      '闽',
      '赣',
      '鲁',
      '豫',
      '鄂',
      '湘',
      '粤',
      '桂',
      '琼',
      '渝',
      '川',
      '贵',
      '云',
      '藏',
      '陕',
      '甘',
      '宁',
      '青',
      '新',
      '使',
      '领'
    ],
    province_codes_index: 0
  }
  provinceCodesChange = e => {
    const { province_codes } = this.data
    this.setData({
      province_codes_index: e.detail.value
    })
    // detail对象，提供给事件监听函数
    const myEventDetail = {
      province: province_codes[e.detail.value]
      // 触发事件的选项
    }
    const myEventOption = {}
    this.triggerEvent('provinceCodesChange', myEventDetail, myEventOption)
  }
  licensePlateChange = e => {
    // detail对象，提供给事件监听函数
    const myEventDetail = {
      license_plate: e.detail.value
    }
    this.setData({
      license_plate: e.detail.value
    })
    // 触发事件的选项
    const myEventOption = {}
    this.triggerEvent('licensePlateChange', myEventDetail, myEventOption)
  }
  config = {
    component: true
  }

  render() {
    const {
      province_codes: province_codes,
      province_codes_index: province_codes_index
    } = this.state
    return (
      <View className="weui-cell weui-cell_select license-plate-content">
        <View className="weui-cell__hd province_codes">
          <Picker
            onChange={this.provinceCodesChange}
            value={province_codes[province_codes_index]}
            range={province_codes}
          >
            <View className="weui-select">
              {province_codes[province_codes_index]}
            </View>
          </Picker>
          {/*  <view class="grid-icon  sparrow-icon icon-newjiaobiaosanjiao"></view>  */}
        </View>
        <View className="weui-cell__bd weui-cell__bd_in-select-before input-content">
          <Input
            className="weui-input"
            placeholder="请输入车牌号"
            onInput={this.licensePlateChange}
            maxlength="7"
          ></Input>
        </View>
      </View>
    )
  }
} // pages/usercenter/components/storeServices/components/parkingPayment/components/LicensePlateInput/index.js

export default _C
