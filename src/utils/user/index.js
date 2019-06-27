/**
 * user
 */
import { getUserInfo, setUserInfo, formatUserInfo } from './userInfo.js'
import login from './login.js'
import expertLogin from './expertLogin.js'

const user = {
  getUserInfo,

  setUserInfo,

  formatUserInfo,

  /**
   * login
   */
  login,
  expertLogin,

  logout: function() {
    setUserInfo(null)
  }
}

export default user
