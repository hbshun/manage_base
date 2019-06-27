import { Block, ScrollView, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class DisplayImageTmpl extends Taro.Component {
  render() {
    const {
      data: {
        chunkArr: chunkArr,
        index: index,
        gridsData: gridsData,
        item: item
      }
    } = this.props
    return (
      <Block>
        <View className="image-out">
          {chunkArr.map((item, index) => {
            return (
              <Block key={'chunk-arr-' + index}>
                <Image
                  style={
                    'width: ' +
                    gridsData[item].width +
                    '; height: ' +
                    gridsData[item].height +
                    'px'
                  }
                  src={gridsData[item].image}
                  data-url={gridsData[item].url}
                  className="item-image"
                  onClick={this.clickNavigateToPage}
                ></Image>
              </Block>
            )
          })}
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
