/**
 * 高级login，fnOlderUser（老用户）登录成功的回调函数，fnNewUser（新用户）登录失败后的回调函数
 * 如果使用login，但是又没有传这俩参数，则默认为空函数 不处理
 */

import user from './index.js'

const expertLogin = (fnOlderUser, fnNewUser) => {
  const funcOlderUser = fnOlderUser || emptyFunction
  const funcNewUser = fnNewUser || emptyFunction

  user.login(funcOlderUser, funcNewUser)
}

/**
 * 空函数 不作处理
 */
const emptyFunction = () => {}

export default expertLogin
