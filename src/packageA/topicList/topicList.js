import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import returnToHome from '../../component/returnToHome/returnToHome.js'

import ReturnToHomeTmpl from '../../imports/ReturnToHomeTmpl.js'
import './topicList.scss'
const topicListPage = {
  /**
   * 页面的初始数据
   */
  data: {
    topicProductList: [] // 专题列表数据
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }

    this.judgeAndShowReturnToHome(options)
    this.getTopicProductListData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const options = util.return_current_page_options()
    const new_options = this.getCurrentPageParameterToShare(options)
    const path = util.return_current_url_with_options(new_options)

    return {
      path
    }
  },

  /**
   * 获得专题列表数据
   */
  getTopicProductListData: function() {
    const _this = this
    util.request({
      url: constant.getTopicProductData,
      method: 'GET',
      hasToken: false,
      success: function(res) {
        _this.handleTopicProductListData(res)
      }
    })
  },

  /**
   * 处理专题列表数据
   */
  handleTopicProductListData: function(data) {
    let topicProductList = [],
      topicObj

    for (let i = 0; i < data.length; i++) {
      let obj = {}
      topicObj = data[i]
      obj.name = topicObj.name
      obj.description = topicObj.description
      obj.endTime = topicObj.end_time
      obj.time = ''

      obj.url =
        topicObj.destination_url && topicObj.destination_url.url
          ? topicObj.destination_url.url
          : null

      let processImage = topicObj.image

      if (util.needPrecssImage(processImage)) {
        processImage = processImage + constant.imageSuffix.focus
      }
      obj.img = processImage

      topicProductList.push(obj)
    }

    this.endTimecountDown(topicProductList)
  },

  /**
   * 点击活动进入专题页
   */
  topicListRredirectToDetail: function(e) {
    const index = e.currentTarget.dataset.index
    const url = this.data.topicProductList[index].url

    if (url) {
      Taro.navigateTo({
        url: url
      })
    } else {
      Taro.showModal({
        title: '提示',
        content: '连接出错，请稍后再试',
        showCancel: false
      })
    }
  },

  /**
   * 倒计时
   */
  endTimecountDown: function(topicProductList) {
    const _this = this

    for (let i = 0; i < topicProductList.length; i++) {
      topicProductList[i].time = _this.orderClosedTime(
        topicProductList[i].endTime
      )
    }

    _this.setData({
      topicProductList
    })
  },

  /**
   * 计算订单还有多长时间到期
   */
  // orderClosedTime: function (endDate) {

  //   const nowTime = new Date();
  //   const endDate_ = new Date(endDate + 'Z'); // 后台返回的时间是中国区时间,一般newDate后单位会变成中国区时间,但是如果在小程序中单位会变成格林威治时间，为了消除差异，把返回时间强制变成格林威治时间（单位改变，但是数值不变），格林威治时间比中国时间要晚8小时

  //   const timeDifferent = (new Date()).getTimezoneOffset(); // 当地时间与的格林威治时间差，单位：分

  //   const endTime = endDate_.getTime() + timeDifferent * 60 * 1000; // 转成当地时间

  //   const twoDay = 2 * 24 * 60 * 60 * 1000; // 2天

  //   if (endTime - nowTime.getTime() > twoDay) {
  //     // 大于2天只显示天数
  //     const remainDay = Math.floor((endTime - nowTime.getTime()) / ( 24 * 60 * 60 * 1000));
  //     return '剩余' + remainDay + '天';
  //   } else if (endTime - nowTime.getTime() < 0) {

  //     clearInterval(this.data.timer);
  //     return `活动已结束`;
  //   } else {

  //     const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000);
  //     const hour = this.formatNumber(Math.floor(differenceTime / 3600));
  //     const remainderMinute = differenceTime % 3600;
  //     const minute = this.formatNumber(Math.floor(remainderMinute / 60));
  //     const remainderSecond = remainderMinute % 60;
  //     const second = this.formatNumber(remainderSecond);

  //     return `剩余：${hour}小时${minute}分钟${second}秒`;
  //   }
  // },

  orderClosedTime: function(endDate) {
    const nowTime = new Date()
    const endDate_ = new Date(endDate + 'Z') // 后台返回的时间是中国区时间,一般newDate后单位会变成中国区时间,但是如果在小程序中单位会变成格林威治时间，为了消除差异，把返回时间强制变成格林威治时间（单位改变，但是数值不变），格林威治时间比中国时间要晚8小时

    const timeDifferent = new Date().getTimezoneOffset() // 当地时间与的格林威治时间差，单位：分
    const endTime = endDate_.getTime() + timeDifferent * 60 * 1000 // 转成当地时间
    const twoDay = 2 * 24 * 60 * 60 * 1000 // 2天
    const oneHour = 60 * 60 * 1000 // 1小时

    if (endTime - nowTime.getTime() > twoDay) {
      // 大于48小时不显示
      return ''
    } else if (endTime - nowTime.getTime() > oneHour) {
      // 小于48小时，大于1小时，只显示小时
      const differenceTime = Math.floor((endTime - nowTime.getTime()) / 1000)
      const hour = Math.floor(differenceTime / 3600)

      return `剩余：${hour}小时`
    } else if (endTime - nowTime.getTime() > 0) {
      // 小于1小时，显示“小于1小时”
      return `剩余：小于1小时`
    } else {
      return `活动已结束`
    }
  },

  /**
   * 数位补全
   */
  formatNumber: function(n) {
    n = n.toString()
    if (n == 0) {
      return '00'
    } else {
      return n[1] ? n : '0' + n
    }
  }
}

const assignedObject = util.assignObject(topicListPage, returnToHome)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '剁手灵感',
    enablePullDownRefresh: false
  }

  render() {
    const {
      topicProductList: topicProductList,
      showReturnToHome: showReturnToHome
    } = this.state
    return (
      <View className="page">
        {topicProductList.map((item, index) => {
          return (
            <View
              key={'topic-product-list-' + index}
              data-index={index}
              onClick={this.topicListRredirectToDetail}
            >
              <View className="topic-image">
                <Image src={item.img}></Image>
                {item.time && <Text>{item.time}</Text>}
              </View>
              <View className="topic-str">
                <View className="topic-name">{item.name}</View>
                <View className="topic-subname">{item.description}</View>
              </View>
            </View>
          )
        })}
        <ReturnToHomeTmpl
          data={{
            showReturnToHome: showReturnToHome
          }}
        ></ReturnToHomeTmpl>
      </View>
    )
  }
}

export default _C
