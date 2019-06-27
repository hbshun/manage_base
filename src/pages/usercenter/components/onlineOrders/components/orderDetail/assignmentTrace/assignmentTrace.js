import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import constant from '../../../../../../../config/constant.js'
import util from '../../../../../../../utils/util.js'

import './assignmentTrace.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {}
  componentWillMount = (options = this.$router.params || {}) => {
    const expressCode = options.express_code
    const expressNum = options.express_num
    const expressName = options.express_name
    const orderNum = options.order_number
    this.getExpressInfo(expressCode, expressNum, expressName, orderNum)
  }
  componentDidShow = () => {}
  getExpressInfo = (expressCode, expressNum, expressName, orderNum) => {
    const _this = this
    util.request({
      url: constant.getExpressInfo,
      method: 'POST',
      data: {
        express_company: expressCode,
        express_order: expressNum
      },
      success: function(res) {
        _this.handleExpressInfo(res.data, expressNum, expressName, orderNum)
      }
    })
  }
  handleExpressInfo = (traceData, expressNum, expressName, orderNum) => {
    this.setData({
      traceData,
      expressNum,
      expressName,
      orderNum
    })
  }
  config = {
    navigationBarTitleText: '物流跟踪',
    enablePullDownRefresh: false
  }

  render() {
    const {
      orderNum: orderNum,
      expressName: expressName,
      expressNum: expressNum,
      traceData: traceData
    } = this.state
    return (
      <View>
        <View className="order-title">
          <View className="order-top">
            <View className="order-top-left">
              <Image src className="sparrow-icon icon-assignment-trace"></Image>
            </View>
            <View className="order-top-right">
              <View className="order-line">
                <Span className="grey">订单编号：</Span>
                {orderNum}
              </View>
              <View className="order-line">
                <Span className="grey">物流公司：</Span>
                {expressName}
              </View>
              <View className="order-line">
                <Span className="grey">物流单号：</Span>
                {expressNum}
              </View>
            </View>
          </View>
        </View>
        {traceData.length > 0 && (
          <View className="trace-content">
            <View className="trace-content-left"></View>
            <View className="trace-content-right">
              {traceData.map((item, index) => {
                return (
                  <View
                    key={'trace-data-' + index}
                    className="trace-item present"
                  >
                    {index < traceData.length - 1 ? (
                      <View className="trace-image-out">
                        {index == 0 ? (
                          <Image
                            src={require('../../../../../../../image/trace/precent.png')}
                            className="trace-image precent"
                          ></Image>
                        ) : (
                          <Image
                            src={require('../../../../../../../image/trace/old.png')}
                            className="trace-image"
                          ></Image>
                        )}
                      </View>
                    ) : (
                      index == traceData.length - 1 && (
                        <View className="trace-image-out first-trace">
                          <Image
                            src={require('../../../../../../../image/trace/old.png')}
                            className="trace-image"
                          ></Image>
                        </View>
                      )
                    )}
                    <Span className="express-info">{item.context}</Span>
                    <Span className="express-time">{item.ftime}</Span>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </View>
    )
  }
}

export default _C
