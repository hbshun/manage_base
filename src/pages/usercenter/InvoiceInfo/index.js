import { Block, View, Icon, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    invoice_url: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    this.setData({
      invoice_url: decodeURIComponent(options.invoice_url)
    })
  }
  componentDidMount = () => {}
  componentDidShow = () => {}
  componentDidHide = () => {}
  componentWillUnmount = () => {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  onShareAppMessage = () => {}
  copyToShearPlate = () => {
    const { invoice_url } = this.data
    Taro.setClipboardData({
      data: invoice_url,
      success(res) {
        Taro.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        })
        Taro.getClipboardData({
          success(res) {
            console.log(res.data)
          }
        })
      }
    })
  }
  redirectToOrderList = () => {
    Taro.navigateBack({
      delta: 1
    })
  }
  config = {
    enablePullDownRefresh: false
  }

  render() {
    const { invoice_url: invoice_url } = this.state
    return (
      <Block>
        <View className="invoice-title-content">
          <Icon
            className="invoice-icon"
            type="success"
            size="50rpx"
            color="red"
          ></Icon>
          <View className="invoice-title">发票开立完成</View>
        </View>
        <View className="invoice-content">
          <View className="weui-cells__title">
            请复制以下信息，再浏览器中打开查看发票
          </View>
          <View className="weui-cells weui-cells_after-title">
            <View className="weui-cell weui-cell_input weui-cell_vcode">
              <View className="weui-cell__bd">
                <Input className="weui-input" value={invoice_url}></Input>
              </View>
              <View className="weui-cell__ft">
                <View
                  className="weui-vcode-btn"
                  onClick={this.copyToShearPlate}
                >
                  复制
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="weui-btn-area confirm-button">
          <Button
            className="weui-btn"
            style="color:#cdbba1;width:400rpx;"
            type="default"
            onClick={this.redirectToOrderList}
          >
            返回订单
          </Button>
        </View>
      </Block>
    )
  }
} // pages/usercenter/components/storeServices/components/shoppingRecord/components/InvoiceInfo/index.js

export default _C
