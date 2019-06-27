import { Block, View, Icon, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/usercenter/invoiceOpening/components/invoicedSucess/index.js
import util from '../../../../../utils/util.js'
import constant from '../../../../../config/constant.js'
import './index.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    invoice_url: '',
    phone: '',
    type: ''
  }
  componentWillMount = (options = this.$router.params || {}) => {
    console.log(options)
    this.setData({
      invoice_url: options.invoice_url,
      type: options.type,
      account_id: options.account_id
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
    const _this = this
    const { invoice_url } = _this.data
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
            console.log(res.data) // data
          }
        })
      }
    })
  }
  getPhone = e => {
    this.setData({
      phone: e.detail.value
    })
  }
  sendInvoiceUrlToPhone = () => {
    const _this = this
    const { invoice_url, phone } = _this.data

    Taro.showModal({
      title: '提示',
      content: '确定将发票信息发送给' + phone,
      success: function(res) {
        if (!res.cancel && res.confirm) {
          util.request({
            url: constant.sendToMessage,
            data: {
              phones: [phone],
              content: '您的发票地址为：' + invoice_url
            },
            method: 'POST',
            success: function(res) {
              Taro.showToast({
                title: '发送成功',
                icon: 'success',
                duration: 2000
              })
            }
          })
        } else {
          Taro.showToast({
            title: '发送失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }
  redirectToOrderList = () => {
    let { type, account_id } = this.data
    if (type === 'offline') {
      Taro.redirectTo({
        url: `/pages/usercenter/components/storeServices/components/shoppingRecord/index?account_id=${account_id}`
      })
    } else if (type === 'online') {
      Taro.redirectTo({
        url:
          '/pages/usercenter/components/onlineOrders/components/orderList/index'
      })
    } else {
      Taro.reLaunch({
        url: '/pages/usercenter/index/index'
      })
    }
  }
  config = {}

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
            请复制以下信息，在浏览器中打开查看发票
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
          <View className="weui-cells__title send-sms">或发送到手机</View>
          <View className="weui-cells weui-cells_after-title">
            <View className="weui-cell weui-cell_input weui-cell_vcode">
              <View className="weui-cell__bd">
                <Input
                  className="weui-input"
                  type="number"
                  placeholder="请输入接收短信的手机号"
                  onInput={this.getPhone}
                ></Input>
              </View>
              <View className="weui-cell__ft">
                <View
                  className="weui-vcode-btn"
                  onClick={this.sendInvoiceUrlToPhone}
                >
                  发送短信
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
            返回订单列表
          </Button>
        </View>
      </Block>
    )
  }
}

export default _C
