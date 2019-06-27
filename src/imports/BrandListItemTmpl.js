import { Block, View, Navigator, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class BrandListItemTmpl extends Taro.Component {
  render() {
    const {
      data: { brandListItemData: brandListItemData, index: index, item: item }
    } = this.props
    return (
      <Block>
        {icon === 'phone' && (
          <Block>
            {brandListItemData.map((item, index) => {
              return (
                <View
                  key={'brand-list-phone-' + index}
                  className="weui-media-box weui-media-box_appmsg brand-item"
                >
                  <View className="brand-item-content">
                    <Navigator
                      url={'/pages/brand/detail/detail?id=' + item.id}
                      className="weui-media-box__hd weui-media-box__hd_in-appmsg brand-item-img"
                    >
                      <Image
                        className="weui-media-box__thumb"
                        src={item.logo}
                      ></Image>
                    </Navigator>
                    {/* 内容 */}
                    <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                      <View className="display-flex">
                        <Navigator
                          url={'/pages/brand/detail/detail?id=' + item.id}
                          className="flex-grow-1"
                        >
                          <View className="weui-media-box__title">
                            {item.name}
                            {item.is_new && (
                              <View className="brand-new">
                                <I className="sparrow-icon icon-new-brand"></I>
                              </View>
                            )}
                          </View>
                          <View className="weui-media-box__desc">
                            <I className="sparrow-icon icon-address"></I>
                            {item.location}
                          </View>
                        </Navigator>
                        <View
                          className="brand-phone"
                          data-phone={item.contact}
                          onClick={this.list_handleMakePhoneCall}
                        >
                          <I className="sparrow-icon icon-phone"></I>
                        </View>
                      </View>
                      <Navigator
                        url={'/pages/brand/detail/detail?id=' + item.id}
                        className="flex-grow-1"
                        className="weui-media-box__desc pt30 clearfix position-re"
                      >
                        <Text className="brand-category">
                          {item.categoryStr}
                        </Text>
                        {item.product_quantity > 0 && (
                          <View className="online-sale">
                            {item.product_quantity + '件 在售'}
                          </View>
                        )}
                      </Navigator>
                    </View>
                  </View>
                </View>
              )
            })}
          </Block>
        )}
        {/* 列表项结束 */}
        {/* 列表项开始 */}
        {icon === 'arrows' && (
          <Block>
            {brandListItemData.map((item, index) => {
              return (
                <Navigator
                  openType="redirect"
                  url={'/pages/brand/detail/detail?id=' + item.id}
                  key={'brand-list-arrows-' + index}
                  className="weui-media-box weui-media-box_appmsg brand-item item-arrows"
                >
                  <View className="brand-item-content">
                    <View className="weui-media-box__hd weui-media-box__hd_in-appmsg brand-item-img">
                      <Image
                        className="weui-media-box__thumb"
                        src={item.logo}
                      ></Image>
                    </View>
                    {/* 内容 */}
                    <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                      <View className="weui-media-box__title">
                        {item.name}
                        {item.is_new && (
                          <View className="brand-new">
                            <I className="sparrow-icon icon-new-brand"></I>
                          </View>
                        )}
                      </View>
                      <View className="weui-media-box__desc">
                        <I className="sparrow-icon icon-address"></I>
                        {item.location}
                      </View>
                      <View className="weui-media-box__desc mt30 clearfix">
                        <Text>{item.categoryStr}</Text>
                      </View>
                    </View>
                  </View>
                  {/*  icon: phone arrows none  */}
                  {/*  箭头  */}
                  <View className="brand-arrows">
                    <I className="sparrow-icon icon-enter"></I>
                  </View>
                </Navigator>
              )
            })}
          </Block>
        )}
        {/* 列表项结束 */}
        {/* 列表项开始 */}
        {icon === 'none' && (
          <Block>
            {brandListItemData.map((item, index) => {
              return (
                <View
                  key={'brand-list-none-' + index}
                  className="weui-media-box weui-media-box_appmsg brand-item"
                >
                  <Navigator
                    className="brand-item-content"
                    url={'/pages/brand/detail/detail?id=' + item.id}
                  >
                    <View className="weui-media-box__hd weui-media-box__hd_in-appmsg brand-item-img">
                      <Image
                        className="weui-media-box__thumb"
                        src={item.logo}
                      ></Image>
                    </View>
                    {/* 内容 */}
                    <View className="weui-media-box__bd weui-media-box__bd_in-appmsg">
                      <View className="weui-media-box__title">
                        {item.name}
                        {item.is_new && (
                          <View className="brand-new">
                            <I className="sparrow-icon icon-new-brand"></I>
                          </View>
                        )}
                      </View>
                      <View className="weui-media-box__desc">
                        <I className="sparrow-icon icon-address"></I>
                        {item.location}
                      </View>
                      <View className="weui-media-box__desc mt30 clearfix">
                        <Text>{item.categoryStr}</Text>
                      </View>
                    </View>
                  </Navigator>
                  {/*  icon: phone arrows none  */}
                  {/* 电话 */}
                  <View className="brand-none"></View>
                </View>
              )
            })}
          </Block>
        )}
        {/* 列表项结束 */}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
