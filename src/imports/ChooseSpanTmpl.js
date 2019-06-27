import { Block, View, Icon, Input, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class ChooseSpanTmpl extends Taro.Component {
  render() {
    const {
      data: {
        titleName: titleName,
        name: name,
        showHideType: showHideType,
        canShare: canShare,
        values: values,
        index: index,
        brandName: brandName
      }
    } = this.props
    return (
      <Block>
        <View className="mb-25">
          <View className="popup-property-head" data-hi={titleName}>
            {name}
            <Text className="popup-property-more-choose">（可多选）</Text>
            {showHideType == 0 ? (
              <Text className></Text>
            ) : showHideType == 1 ? (
              <Text
                data-name={name}
                className="sparrow-icon icon-fold choose-show-more"
                onClick={this.changeShowHideType}
              ></Text>
            ) : (
              <Text
                data-name={name}
                className="sparrow-icon icon-unfold choose-show-more"
                onClick={this.changeShowHideType}
              ></Text>
            )}
          </View>
          {/*  从搜索页面进来的(可以分享) && 该tab是品牌信息  */}
          {canShare == 1 && name == '品牌' ? (
            <View className={showHideType == 1 ? 'span-list' : ''}>
              {values.map((brandName, index) => {
                return (
                  <Block key={'choose-brand-span-' + index}>
                    {brandName.text && (
                      <Text
                        className={
                          'popup-property-options ' +
                          (brandName.isChoose == true
                            ? ' popup-property-options-selected'
                            : '')
                        }
                        onClick={this.chooseSpan}
                        data-name={name}
                        data-id={brandName.id}
                        data-index={index}
                      >
                        {brandName.text}
                      </Text>
                    )}
                  </Block>
                )
              })}
            </View>
          ) : (
            <View className={showHideType == 1 ? 'span-list' : ''}>
              {values.map((brandName, index) => {
                return (
                  <Block key={'choose-span-' + index}>
                    {brandName.text && (
                      <Text
                        className={
                          'popup-property-options ' +
                          (brandName.isChoose == true
                            ? ' popup-property-options-selected'
                            : '')
                        }
                        onClick={this.chooseSpan}
                        data-name={name}
                        data-index={index}
                      >
                        {brandName.text}
                      </Text>
                    )}
                  </Block>
                )
              })}
            </View>
          )}
          {/*  购物车中的根据活动id进入搜索引擎（不能分享）或者 tab是除了品牌之外的tab  */}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
