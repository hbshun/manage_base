import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './test.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    img_arr: [
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560',
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2F190505809311011.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560',
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560',
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560',
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560',
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560',
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560',
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560'
    ],
    item:
      'https://img-backend.hanguangbaihuo.com/media%2Fsparrow_product%2FAQ5224-605.jpg?x-oss-process=image/resize,m_fixed,w_560,h_560'
  }
  config = {}

  render() {
    const { item: item } = this.state
    return (
      <View id="root">
        <View className="item">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item" style="height:290px; background-color:#ccc">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item" style="height:400px; background-color:#ccc">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item" style="height:290px; background-color:#ccc">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item" style="height:380px; background-color:#ccc">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item" style="height:290px; background-color:#ccc">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        <View className="item" style="height:400px; background-color:#ccc">
          <Image className="itemImg" src={item} alt></Image>
          <View className="userInfo">
            <Image
              className="avatar"
              src={require('../images/gift.png')}
              alt
            ></Image>
            <Span className="username">啦啦啦啦啦</Span>
          </View>
        </View>
        {/*  </block>  */}
      </View>
    )
  }
}

export default _C
