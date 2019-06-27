import {
  Block,
  View,
  Input,
  Picker,
  Textarea,
  Button
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'

import util from '../../../../utils/util.js'
import constant from '../../../../config/constant.js'

import './addAddress.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    name: '',
    phone: '',
    addressDetail: '',
    fromUser: 0 // 这个为0时表示从订单详情选择地址进入本页，这个为1时表示从订单从个人中心进入本页
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onLoad: function(options) {
    const fromUser = options.from_user
    if (fromUser) {
      this.setData({
        fromUser: 1
      })
    }

    if (wx.globalData.editAddressUrl) {
      this.getAddressInfo(wx.globalData.editAddressUrl)
    }
  },

  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    })
  },

  /**
   * 获得该地址详细信息
   */
  getAddressInfo: function(url) {
    const that = this

    util.request({
      url: url,
      method: 'GET',
      success: function(data) {
        const region = []
        region[0] = data.province
        region[1] = data.city
        region[2] = data.district

        that.setData({
          region: region,
          name: data.name,
          phone: data.phone,
          addressDetail: data.detail
        })
      }
    })
  },

  /**
   * 填写名字信息
   */
  inputName: function(e) {
    this.data.name = e.detail.value
  },

  /**
   * 填写电话信息
   */
  inputPhone: function(e) {
    this.data.phone = e.detail.value
  },

  /**
   * 填写具体地址
   */
  inputAddress: function(e) {
    this.data.addressDetail = e.detail.value
  },

  /**
   * 点击保存并使用
   */
  clickSave: function() {
    const { name, phone, region, addressDetail } = this.data

    // if (name != '' && phone.length == 11 && region.length && 3) {

    //   this.requestAdd(name, phone, region, addressDetail);
    // } else {

    //   wx.showModal({
    //     title: '提示',
    //     content: '请填写完整信息',
    //     showCancel: false,
    //     success: function (res) {

    //     }
    //   });
    // }

    if (name == '') {
      Taro.showToast({
        title: '请填写收货人姓名',
        icon: 'none'
      })
      return
    }

    if (phone.length != 11) {
      Taro.showToast({
        title: '请填写正确的联系电话',
        icon: 'none'
      })
      return
    }

    if (region.length <= 0) {
      Taro.showToast({
        title: '请选择所在的地区',
        icon: 'none'
      })
      return
    }

    if (!addressDetail) {
      Taro.showToast({
        title: '请填写详细地址',
        icon: 'none'
      })
      return
    }
    this.requestAdd(name, phone, region, addressDetail)
  },

  /**
   *
   */
  requestAdd: function(name, phone, region, addressDetail) {
    let url = constant.loadAddress
    let method = 'POST'
    const _this = this

    if (wx.globalData.editAddressUrl) {
      method = 'PUT'
      url = wx.globalData.editAddressUrl
    }

    util.request({
      url: url,
      method: method,
      data: {
        name: name,
        phone: phone,
        title: '',
        province: region[0],
        city: region[1],
        district: region[2],
        detail: addressDetail,
        status: false
      },
      success: function(data) {
        wx.globalData.editAddressUrl = ''

        if (_this.data.fromUser == 1) {
          Taro.navigateBack({
            delta: 1
          })
        } else {
          // 使用本地址为订单地址
          const addId = data.id
          util.request({
            url: constant.chooseAddress,
            method: 'POST',
            data: {
              address_id: addId
            },
            success: function(data) {
              Taro.navigateBack({
                delta: 2
              })
            }
          })
        }
      }
    })
  }
}

@withWeapp('Page', pageData)
class _C extends Taro.Component {
  config = {
    enablePullDownRefresh: false,
    navigationBarTitleText: '新增收货地址'
  }

  render() {
    const {
      name: name,
      phone: phone,
      region: region,
      addressDetail: addressDetail,
      fromUser: fromUser
    } = this.state
    return (
      <View className="add-manage-address">
        <View className="page-section">
          <View className="weui-cells weui-cells_after-title">
            <View className="weui-cell weui-cell_input">
              <Input
                className="weui-input"
                value={name}
                maxlength="10"
                placeholder="收货人姓名"
                onInput={this.inputName}
              ></Input>
            </View>
          </View>
        </View>
        <View className="page-section">
          <View className="weui-cells weui-cells_after-title">
            <View className="weui-cell weui-cell_input">
              <Input
                className="weui-input"
                value={phone}
                type="number"
                maxlength="11"
                placeholder="11位手机号码"
                onInput={this.inputPhone}
              ></Input>
            </View>
          </View>
        </View>
        <View className="page-section choose-area">
          <View className="weui-cells weui-cells_after-title">
            <View className="weui-cell weui-cell_input">
              <Picker
                mode="region"
                style="width:100%"
                value="dd"
                onChange={this.bindRegionChange}
              >
                <View className="weui-input">
                  <Span>
                    {region.length > 0
                      ? region[0] + ' ' + region[1] + ' ' + region[2]
                      : '选择省、市、区'}
                  </Span>
                  <I className="sparrow-icon icon-enter"></I>
                </View>
              </Picker>
            </View>
          </View>
        </View>
        <View className="textarea-view">
          <Textarea
            rows="3"
            value={addressDetail}
            placeholder="详细地址"
            onInput={this.inputAddress}
          ></Textarea>
        </View>
        {fromUser == 1 ? (
          <View className="save-view">
            <Button type="warn" onClick={this.clickSave}>
              保存
            </Button>
          </View>
        ) : (
          <View className="save-view">
            <Button type="warn" onClick={this.clickSave}>
              保存并使用
            </Button>
          </View>
        )}
      </View>
    )
  }
}

export default _C
