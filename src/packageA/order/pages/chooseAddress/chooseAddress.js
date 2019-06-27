import { Block, View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'

import constant from '../../../../config/constant.js'
import util from '../../../../utils/util.js'

import './chooseAddress.scss'
const pageData = {
  /**
   * 页面的初始数据
   */
  data: {
    manageAddress: false,
    allAddress: [],
    fromUser: 0 // 这个为0时表示从订单详情选择地址进入本页，这个为1时表示从订单从个人中心进入本页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const fromUser = options.from_user
    if (fromUser) {
      this.setData({
        fromUser: 1
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.loadAddress()
    util.printLog('wechat_app', 'manage_addr', '')
  },

  /**
   * 跳转到管理收货地址页面
   */
  manageAddress: function() {
    this.setData({
      manageAddress: true
    })
  },

  /**
   * 跳转到添加收货地址页面
   */
  addAddress: function() {
    wx.globalData.editAddressUrl = ''
    this.setData({
      manageAddress: false
    })

    // wx.navigateTo({
    //   url: '../addAddress/addAddress',
    // })

    if (this.data.fromUser) {
      // 从用户中心页进来的（为了保存地址时仅保存不使用）
      Taro.navigateTo({
        url: '../addAddress/addAddress?from_user=1'
      })
    } else {
      Taro.navigateTo({
        url: '../addAddress/addAddress'
      })
    }
  },

  /**
   * 返回选择收货地址
   */
  returnAddress: function() {
    this.setData({
      manageAddress: false
    })
  },

  /**
   * 加载地址信息
   */
  loadAddress: function() {
    const that = this
    util.request({
      url: constant.loadAddress,
      method: 'GET',
      success: function(data) {
        that.setData({
          allAddress: data.results
        })
      }
    })
  },

  /**
   * 选择地址
   */
  chooseAddress: function(e) {
    const addId = e.currentTarget.dataset.addId

    util.request({
      url: constant.chooseAddress,
      method: 'POST',
      data: {
        address_id: addId
      },
      success: function(data) {
        // wx.redirectTo({
        //   url: '/packageA/order/order',
        // })
        Taro.navigateBack({
          delta: 1
        })
      }
    })
  },

  /**
   * 设置默认地址
   */
  setDefault: function(e) {
    const id = e.currentTarget.dataset.addId
    let allAddress = this.data.allAddress

    for (let i = 0; i < allAddress.length; i++) {
      if (allAddress[i].id == id) {
        allAddress[i].status = true
        this.setDefaultAdd(i)
      } else {
        allAddress[i].status = false
      }
    }

    this.setData({
      allAddress
    })
  },

  /**
   * 向后台发送默认地址
   */
  setDefaultAdd: function(index) {
    let data = this.data.allAddress[index]

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: this.data.allAddress[index].url,
      data: data,
      method: 'PUT',
      success: function() {
        Taro.hideToast()
      }
    })
  },

  /**
   * 删除地址
   */
  deleteAddress: function(e) {
    const index = e.currentTarget.dataset.addIndex
    const that = this

    Taro.showModal({
      title: '提示',
      content: '确定删除地址',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          that.postFunction(index)
        }
      }
    })
  },

  /**
   * 向后台发送删除请求
   */
  postFunction: function(index) {
    const that = this

    Taro.showToast({
      icon: 'loading',
      mask: true,
      duration: 20000
    })

    util.request({
      url: that.data.allAddress[index].url,
      method: 'DELETE',
      success: function() {
        const allAddress = that.data.allAddress
        allAddress.splice(index, 1)
        that.setData({
          allAddress
        })

        Taro.hideToast()
      }
    })
  },

  /**
   * 点击编辑按钮
   */
  editAddress: function(e) {
    const url = e.currentTarget.dataset.url
    wx.globalData.editAddressUrl = url

    // wx.navigateTo({
    //   url: '../addAddress/addAddress',
    // })
    if (this.data.fromUser) {
      // 从用户中心页进来的（为了保存地址时仅保存不使用）
      Taro.navigateTo({
        url: '../addAddress/addAddress?from_user=1'
      })
    } else {
      Taro.navigateTo({
        url: '../addAddress/addAddress'
      })
    }
  }
}

const assignedObject = util.assignObject(pageData)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    enablePullDownRefresh: false,
    navigationBarTitleText: '地址管理'
  }

  render() {
    const {
      allAddress: allAddress,
      manageAddress: manageAddress,
      fromUser: fromUser
    } = this.state
    return (
      <View>
        <View className="address-list">
          {manageAddress ? (
            <Block>
              <View className="manage">
                {allAddress.map((address, itemIndex) => {
                  return (
                    <Block key="*this">
                      <View className="manage-item">
                        <View className="address-info">
                          <View className="personal-info">
                            <Text className="name">{address.name}</Text>
                            <Text className="number">{address.phone}</Text>
                          </View>
                          <View className="personal-address">
                            {address.province +
                              address.city +
                              address.district +
                              address.detail}
                          </View>
                        </View>
                        <View className="manage-line">
                          {address.status ? (
                            <View className="choose-default">
                              <I
                                className="sparrow-icon icon-choose"
                                data-add-id={address.id}
                                onClick={this.setDefault}
                              ></I>
                              <Span>设为默认地址</Span>
                            </View>
                          ) : (
                            <View className="choose-default">
                              <I
                                className="sparrow-icon icon-not-choose"
                                data-add-id={address.id}
                                onClick={this.setDefault}
                              ></I>
                              <Span>设为默认地址</Span>
                            </View>
                          )}
                          <View className="manage-btn">
                            <Span
                              className="edit-btn"
                              data-url={address.url}
                              onClick={this.editAddress}
                            >
                              编辑
                            </Span>
                            <Span
                              className="delete-btn"
                              data-add-index={itemIndex}
                              onClick={this.deleteAddress}
                            >
                              删除
                            </Span>
                          </View>
                        </View>
                      </View>
                    </Block>
                  )
                })}
              </View>
            </Block>
          ) : (
            <Block>
              <View className="choose">
                {fromUser === 1 ? (
                  <Block>
                    {allAddress.map((address, index) => {
                      return (
                        <Block key="*this">
                          <View
                            className="choose-item"
                            data-add-id={address.id}
                          >
                            <View className="address-info">
                              <View className="personal-info">
                                <Text className="name">{address.name}</Text>
                                <Text className="number">{address.phone}</Text>
                              </View>
                              <View className="personal-address">
                                {address.status && (
                                  <Span className="default-address">
                                    [默认地址]
                                  </Span>
                                )}
                                {address.province +
                                  address.city +
                                  address.district +
                                  address.detail}
                              </View>
                            </View>
                            {/*  <view class="choose-btn">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <i wx:if="{{}}" class="sparrow-icon icon-not-choose"></i>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <i wx:else class="sparrow-icon icon-choose"></i>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </view>  */}
                          </View>
                        </Block>
                      )
                    })}
                  </Block>
                ) : (
                  <Block>
                    {allAddress.map((address, index) => {
                      return (
                        <Block key="*this">
                          <View
                            className="choose-item"
                            data-add-id={address.id}
                            onClick={this.chooseAddress}
                          >
                            <View className="address-info">
                              <View className="personal-info">
                                <Text className="name">{address.name}</Text>
                                <Text className="number">{address.phone}</Text>
                              </View>
                              <View className="personal-address">
                                {address.status && (
                                  <Span className="default-address">
                                    [默认地址]
                                  </Span>
                                )}
                                {address.province +
                                  address.city +
                                  address.district +
                                  address.detail}
                              </View>
                            </View>
                          </View>
                        </Block>
                      )
                    })}
                  </Block>
                )}
              </View>
            </Block>
          )}
        </View>
        <View className="address-manage-btn">
          {manageAddress ? (
            <View className="btn-white" onClick={this.returnAddress}>
              返回
            </View>
          ) : (
            <View className="btn-white" onClick={this.manageAddress}>
              管理收货地址
            </View>
          )}
          <View className="btn-red" onClick={this.addAddress}>
            新增收货地址
          </View>
        </View>
      </View>
    )
  }
}

export default _C
