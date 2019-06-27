import { Block, View, Image, Text, Button, Navigator } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class OrderTraceTmpl extends Taro.Component {
  render() {
    const {
      data: { status: status, orderType: orderType }
    } = this.props
    return (
      <Block>
        {status.isAssignmentPage ? (
          <Block>
            {status.shippingMethod === 'express' ? (
              <View className="weui-panel__bd order-trace">
                {status.hasExpressInfo ? (
                  <Navigator
                    url={status.isAssignmentPage ? status.traceUrl : ''}
                    className="weui-media-box weui-media-box_appmsg order-trace-box"
                  >
                    <View className="weui-media-box__hd weui-media-box__hd_in-appmsg order-trace-icon">
                      <I className="sparrow-icon icon-inform"></I>
                    </View>
                    <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                      <View className="weui-media-box__title order-trace-title">
                        {'您的订单已出库交付给【' +
                          status.express +
                          '】，运单号为：' +
                          status.expressNum}
                      </View>
                      <View className="weui-media-box__desc order-trace-desc">
                        {status.updatedTime}
                      </View>
                    </View>
                    {status.isAssignmentPage && (
                      <View className="weui-cell__ft weui-cell__ft_in-access"></View>
                    )}
                  </Navigator>
                ) : (
                  <Navigator
                    url="/"
                    className="weui-media-box weui-media-box_appmsg order-trace-box"
                  >
                    <View className="weui-media-box__hd weui-media-box__hd_in-appmsg order-trace-icon">
                      <I className="sparrow-icon icon-inform"></I>
                    </View>
                    <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                      <View className="weui-media-box__title order-trace-title">
                        您的这部分包裹已经准备好了，准备发出
                      </View>
                      <View className="weui-media-box__desc order-trace-desc">
                        {status.updatedTime}
                      </View>
                    </View>
                  </Navigator>
                )}
              </View>
            ) : (
              status.shippingMethod === 'self_service' && (
                <View className="weui-panel__bd order-trace">
                  <Navigator
                    url="/"
                    className="weui-media-box weui-media-box_appmsg order-trace-box"
                  >
                    <View className="weui-media-box__hd weui-media-box__hd_in-appmsg order-trace-icon">
                      <I className="sparrow-icon icon-inform"></I>
                    </View>
                    <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                      <View className="weui-media-box__title order-trace-title">
                        您的这部分包裹已经准备好了，您可以前往提货
                      </View>
                      <View className="weui-media-box__desc order-trace-desc">
                        {status.updatedTime}
                      </View>
                    </View>
                  </Navigator>
                </View>
              )
            )}
          </Block>
        ) : (
          <Block>
            {/*  线上订单  */}
            {orderType === 'online' && status.aftersale_status === 'none' && (
              <View className="weui-panel__bd order-trace">
                <Navigator
                  url="/"
                  className="weui-media-box weui-media-box_appmsg order-trace-box"
                >
                  <View className="weui-media-box__hd weui-media-box__hd_in-appmsg order-trace-icon">
                    <I className="sparrow-icon icon-inform"></I>
                  </View>
                  <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                    {status.assignStatus === 'init' &&
                      status.status !== 'closed' && (
                        <View className="weui-media-box__title order-trace-title">
                          正在为您准备商品，请您耐心等待
                        </View>
                      )}
                    {/*  2、可提货/待发货(或者准备中，但是有部分配货)  */}
                    {(status.status === 'to_ship' ||
                      status.status === 'to_pickup') && (
                      <View className="weui-media-box__title order-trace-title">
                        {status.shippingMethod === 'self_service' && (
                          <Block>
                            {status.assignStatus === 'partial' && (
                              <View>
                                您的商品已经
                                <Text className="color-b31b1b">部分</Text>
                                完成备货，请您留意提货短信，并在7日内至汉光百货北侧10层前台提货
                              </View>
                            )}
                            {status.assignStatus === 'completed' && (
                              <View>
                                您的商品已经
                                <Text className="color-b31b1b">全部</Text>
                                完成备货，请您留意提货短信，并在7日内至汉光百货北侧10层前台提货
                              </View>
                            )}
                          </Block>
                        )}
                        {status.shippingMethod === 'express' && (
                          <Block>
                            {status.assignStatus === 'partial' && (
                              <View>
                                您的商品已经
                                <Text className="color-b31b1b">部分</Text>
                                准备好了，准备发出
                              </View>
                            )}
                            {status.assignStatus === 'completed' && (
                              <View>
                                您的商品已经
                                <Text className="color-b31b1b">全部</Text>
                                准备好了，准备发出
                              </View>
                            )}
                          </Block>
                        )}
                      </View>
                    )}
                    {/*  3、已提货，已发货  */}
                    {status.status === 'completed' &&
                      (status.aftersale_status !== 'done' ||
                        status.aftersale_status !== 'open') && (
                        <View className="weui-media-box__title order-trace-title">
                          {status.shippingMethod === 'self_service' ? (
                            <Block>
                              您已经提走了
                              {status.shippingStatus === 'partial' ? (
                                <Text className="color-b31b1b">部分</Text>
                              ) : (
                                status.shippingStatus === 'completed' && (
                                  <Text className="color-b31b1b">全部</Text>
                                )
                              )}
                              的包裹
                              {status.shippingStatus === 'completed' && (
                                <Text>,期待您下次光临</Text>
                              )}
                            </Block>
                          ) : (
                            <Block>
                              您的包裹已经
                              {status.shippingStatus === 'partial' ? (
                                <Text className="color-b31b1b">部分</Text>
                              ) : (
                                status.shippingStatus === 'completed' && (
                                  <Text className="color-b31b1b">全部</Text>
                                )
                              )}
                              发出
                              {status.shippingStatus === 'completed' && (
                                <Text>,期待您下次光临</Text>
                              )}
                            </Block>
                          )}
                        </View>
                      )}
                    {/*  4、已关闭  */}
                    {status.status === 'closed' && (
                      <View className="weui-media-box__title order-trace-title">
                        您的订单已关闭
                      </View>
                    )}
                    <View className="weui-media-box__desc order-trace-desc">
                      {status.updatedTime}
                    </View>
                  </View>
                  {status.isAssignmentPage && (
                    <View className="weui-cell__ft weui-cell__ft_in-access"></View>
                  )}
                </Navigator>
              </View>
            )}
            {/*  闪购订单  */}
            {orderType === 'flashsale' && status.aftersale_status === 'none' && (
              <View className="weui-panel__bd order-trace">
                <Navigator
                  url="/"
                  className="weui-media-box weui-media-box_appmsg order-trace-box"
                >
                  <View className="weui-media-box__hd weui-media-box__hd_in-appmsg order-trace-icon">
                    <I className="sparrow-icon icon-inform"></I>
                  </View>
                  <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                    {status.status === 'to_pickup' && (
                      <View className="weui-media-box__title order-trace-title">
                        您的闪购物品已经准备好了，您可以前往相应专柜进行提货
                      </View>
                    )}
                    {/*  2、已提货  */}
                    {status.status === 'completed' && (
                      <View className="weui-media-box__title order-trace-title">
                        您已经提走了闪购物品,期待您下次光临
                      </View>
                    )}
                    {/*  3、已关闭  */}
                    {status.status === 'closed' && (
                      <View className="weui-media-box__title order-trace-title">
                        您的闪购订单已关闭
                      </View>
                    )}
                    <View className="weui-media-box__desc order-trace-desc">
                      {status.updatedTime}
                    </View>
                  </View>
                  {status.isAssignmentPage && (
                    <View className="weui-cell__ft weui-cell__ft_in-access"></View>
                  )}
                </Navigator>
              </View>
            )}
            {/*  售后订单  */}
            {(status.aftersale_status === 'open' ||
              status.aftersale_status === 'done') && (
              <View className="weui-panel__bd order-trace">
                <Navigator
                  url="/"
                  className="weui-media-box weui-media-box_appmsg order-trace-box"
                >
                  <View className="weui-media-box__hd weui-media-box__hd_in-appmsg order-trace-icon">
                    <I className="sparrow-icon icon-inform"></I>
                  </View>
                  <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                    {status.aftersale_status === 'open' && (
                      <View className="weui-media-box__title order-trace-title">
                        售后进行中
                      </View>
                    )}
                    {/*  已完成售后  */}
                    {status.aftersale_status === 'done' && (
                      <View className="weui-media-box__title order-trace-title">
                        已完成售后
                      </View>
                    )}
                    <View className="weui-media-box__desc order-trace-desc">
                      {status.updatedTime}
                    </View>
                  </View>
                  {status.isAssignmentPage && (
                    <View className="weui-cell__ft weui-cell__ft_in-access"></View>
                  )}
                </Navigator>
              </View>
            )}
          </Block>
        )}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
