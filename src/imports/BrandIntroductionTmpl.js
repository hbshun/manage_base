import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class BrandIntroductionTmpl extends Taro.Component {
  render() {
    const {
      data: { brandInfo: brandInfo, index: index, item: item }
    } = this.props
    return (
      <Block>
        {brandInfo.imgArr.length > 1 ? (
          <Block>
            <View className="brand-introduction" id="brand-introduction">
              <Image
                lazyLoad="true"
                className="brand-introduction-logo"
                src={brandInfo.logo}
              ></Image>
              {/*  品牌专柜的图片展示  */}
              <View className="def-introduction-scroll">
                <ScrollView className="brand-introduction-scroll" scrollX>
                  {brandInfo.imgArr.map((item, index) => {
                    return (
                      <Block key={'brand-image-' + index}>
                        <Image
                          lazyLoad="true"
                          className="brand-introduction-img"
                          src={item}
                          data-src={item}
                          data-images={brandInfo.imgArr}
                          onClick={this.previewImages}
                        ></Image>
                      </Block>
                    )
                  })}
                </ScrollView>
              </View>
              {/*  品牌名称  */}
              <View>
                <Text className="brand-introduction-title">
                  {brandInfo.name}
                </Text>
                <Text className="sale-num">
                  {brandInfo.product_quantity + '件在售'}
                </Text>
              </View>
              <I className="sparrow-icon icon-shop local-back"></I>
              <View className="brand-introduction-desc">
                <Text className="local-text">
                  {'汉光百货·' + brandInfo.location}
                </Text>
                {/*  品牌描述  */}
                {/*  保留换行，用于当分类为空时，能够有一行空白  */}
                <Text className="content-text">{brandInfo.categoriy}</Text>
              </View>
              {/*  专柜电话  */}
              <View
                className="brand-introduction-contact"
                data-phone={brandInfo.phone}
                onClick={this.contactCounter}
              >
                <I className="sparrow-icon icon-phone"></I>
              </View>
            </View>
          </Block>
        ) : (
          <Block>
            <View
              className="def-brand-introduction def-background"
              id="brand-introduction"
              style={'background-image:url(' + brandInfo.imgArr[0] + ')'}
              onClick={this.previewImages}
              data-src={brandInfo.imgArr[0]}
              data-images={brandInfo.imgArr}
            >
              <Image
                lazyLoad="true"
                className="brand-introduction-logo"
                src={brandInfo.logo}
              ></Image>
              <View className="all-introduction-info">
                <View>
                  <Text className="brand-introduction-title">
                    {brandInfo.name}
                  </Text>
                  <Text className="sale-num">
                    {brandInfo.product_quantity + '件在售'}
                  </Text>
                </View>
                <I className="sparrow-icon icon-shop local-back"></I>
                <View className="brand-introduction-desc">
                  <Text className="local-text">
                    {'汉光百货·' + brandInfo.location}
                  </Text>
                  {/*  品牌描述  */}
                  {/*  保留换行，用于当分类为空时，能够有一行空白  */}
                  <Text className="content-text">{brandInfo.categoriy}</Text>
                </View>
                {/*  专柜电话  */}
                <View
                  className="brand-introduction-contact"
                  data-phone={brandInfo.phone}
                  onClick={this.contactCounter}
                >
                  <I className="sparrow-icon icon-phone"></I>
                </View>
              </View>
            </View>
          </Block>
        )}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
