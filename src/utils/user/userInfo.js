import Taro from '@tarojs/taro'
import constant from '../../config/constant.js'

let userInfo = null

/**
 * 获取用户信息
 */
export function getUserInfo() {
  if (userInfo == null) {
    // 否则去 localstore 中取值
    let userInfoStore = Taro.getStorageSync(constant.KEY_USER)
    // 如果是有效用户登录信息则赋值并返回
    if (userInfoStore && userInfoStore.accessToken) {
      userInfo = userInfoStore
    }
  }
  // 否则，返回null
  return userInfo
}

// 保存用户信息
export function setUserInfo(data) {
  userInfo = data
  Taro.setStorageSync(constant.KEY_USER, data)

  if (wx.globalData.userSimpleInfo) {
    wx.globalData.userSimpleInfo.phone = data ? data.phone : null
  }
}

/**
 * 初始化用户信息
 */
export function formatUserInfo(data) {
  let userInfo = Object.create(null)
  userInfo.phone = data.phone
  userInfo.userId = data.user_id
  userInfo.accessToken = data.access_token

  return userInfo
}
