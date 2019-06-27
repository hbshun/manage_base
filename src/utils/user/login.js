import Taro from '@tarojs/taro'
/**
 * login
 */
import constant from '../../config/constant.js'
import { returnLoginUrlWithGotoUrl } from '../returnUrl.js'
import { request, showModalError } from '../weixin.js'
import { getUserInfo, setUserInfo, formatUserInfo } from './userInfo.js'
import GIO_utils from '../../utils/GIO_utils.js'

/**
 * 基础login，如果没有（新用户）登录失败后的回调函数，登录失败后跳到登录页面
 * callback是调用接口登录成功(比如老用户)的回调函数，newUserHandleFunc是调用接口发现登录不成功（比如新用户）的回调函数（比如有时候登录失败需要跳到登录页面，有时登录失败不作处理）
 */
const login = (callback, newUserHandleFunc) => {
  // 获取 code wx.login
  Taro.login({
    success: res => {
      if (res.code) {
        // 获取登录态成功，发起code登录请求
        request({
          url: constant.loginCode,
          method: 'POST',
          data: {
            app_id: constant.appId,
            wechat_app_code: res.code
          },
          success: data => {
            // 登录成功
            if (data.code === 0) {
              setUserInfo(formatUserInfo(data))
              GIO_utils.set_login_user_info_GIO()
              callback && callback()
            }
            // 微信未绑定(新用户)
            else if (data.code === -1400) {
              if (newUserHandleFunc) {
                // 有 新用户的回调函数 时调用回调函数
                newUserHandleFunc()
              } else {
                // 没有 新用户回调函数 时跳转到登录页
                // console.log(util);

                const url = returnLoginUrlWithGotoUrl()
                // 用reLaunch关闭之前打开的所有页面（阻止到登录页面之后点击后退）并且打开登录页面
                Taro.reLaunch({ url })
              }
            }
            // 微信未授权 - 停留在本页不处理
            else if (data.code === -1401) {
              // wx.reLaunch({
              //   url: '/pages/login/login',
              // });
              // wx.showModal({
              //   title: '网络错误，请重试',
              //   content: '',
              //   confirmText: '确定',
              // })
            }
          },
          complete: function() {
            wx.loginStatus = 'completed'
          }
        })
      } else {
        // 获取登录态失败
        showModalError('获取用户登录态失败：' + res.errMsg)
        console.log('获取用户登录态失败：' + res.errMsg)
      }
    },
    fail: err => {
      console.log(err)
      showModalError('获取code失败')
    }
  })
}

export default login
