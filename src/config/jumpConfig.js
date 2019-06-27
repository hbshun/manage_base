// 二维码跳转规则
import constant from './constant.js'

// 注意！！！！这里不能跳转tabBar，因为在jumpBridge里用的是redirectTo跳转
const jumpConfig = {
  // 自动贩卖机，一单一件商品（兰蔻）vendingMachine
  vm: '/vendingMachine/buy/buy',

  // 互动屏下单，小程序结账，一单多件商品，且买完即可提货（sk2）electronicScreen
  es: '/electronicScreen/buy/buy',

  // rfid下单，一单多件商品+买完可提货模式
  rfid: '/rfid/buy/buy',

  // 新田字格
  gp: '/pages/gridsNew/index',

  // 老田字格
  grids: '/packageA/grids/grids'
}

export default jumpConfig
