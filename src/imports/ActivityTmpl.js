import LabelRedTmpl from './LabelRedTmpl'
import { Block, View, Image, Text, Form, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ActivityTmpl extends Taro.Component {
  render() {
    const {
      data: { promotions: promotions, item: item, index: index }
    } = this.props
    return (
      <Block>
        {promotions.map((item, index) => {
          return (
            <View
              onClick={this.activity_showActivityDesc}
              data-id={item.id}
              data-index={index}
              className="weui-cell activity-box"
              key={'activity-' + index}
            >
              <View className="weui-cell__bd">
                <View className="activity-title">
                  <View className="activity-title-l">
                    <LabelRedTmpl
                      data={{
                        value: item.promotionName
                      }}
                    ></LabelRedTmpl>
                  </View>
                  <View className="activity-title-r pl10">
                    <Text className="activity-title">{item.title}</Text>
                  </View>
                </View>
                {/*  商品详情页面会用到这个大图显示赠品  */}
                {item.promotion_type === 'GIFT' && (
                  <View className="activity-image-text">
                    <Image
                      lazyLoad="true"
                      src={item.random_promotion.image}
                    ></Image>
                    <View className="classname">
                      <Text>
                        {item.random_promotion.title +
                          ' ' +
                          (item.random_promotion.description
                            ? ' : ' + item.random_promotion.description
                            : '')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              {/* item.hint 是人为添加的提示内容 如“去凑单” */}
              <View className="weui-cell__ft weui-cell__ft_in-access">
                {item.hint ? item.hint : ''}
              </View>
            </View>
          )
        })}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
