import { Block, View, ScrollView, Image, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
export default class QRcodeTmpl extends Taro.Component {
  render() {
    const {
      data: {
        imagePath: imagePath,
        QRpickupInfo: QRpickupInfo,
        canvasHidden: canvasHidden
      }
    } = this.props
    return (
      <Block>
        {showQRCode && (
          <Block>
            <View className="qr-view">
              <I
                className="sparrow-icon icon-close"
                onClick={this.closeQRCodePickupPopup}
              ></I>
              <View className="container-box">
                <View className="img-box">
                  <Image mode="scaleToFill" src={imagePath}></Image>
                  {/*  <image bindtap="previewImg" mode="scaleToFill" src="{{imagePath}}"></image>  */}
                </View>
              </View>
              <View className="shop-location-out">
                <View className="shop-location">{QRpickupInfo.location}</View>
                <View className="shop-name">{QRpickupInfo.brand}</View>
              </View>
              <View className="canvas-box">
                <Canvas
                  hidden={canvasHidden}
                  style="width: 460rpx;height: 460rpx;background:#f1f1f1;"
                  canvasId="mycanvas"
                ></Canvas>
              </View>
            </View>
            <View
              className="mask-in"
              onClick={this.closeQRCodePickupPopup}
            ></View>
          </Block>
        )}
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
