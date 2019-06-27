import {
  Block,
  View,
  ScrollView,
  Navigator,
  Image,
  Text
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// letter.js
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'

import './letter.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    // letter
    letterValue: '',
    showValue: false,
    top: 50,
    scrollTop: 0,
    letter: {
      top: 65,
      width: 16,
      height: 16,
      tipHeight: 30
    },
    // letter list
    letterList: [],
    brand: {
      height: 100,
      headHeight: 22
    },
    brandList: [],
    brandTop: 0,
    brandData: [],
    letterData: [],
    isLetter: false,
    tabIndex: 0,
    isLoading: true,
    // 鼠标位置
    mouse: {
      y: 0
    },
    isScroll: false
  }
  componentWillMount = (options = this.$router.params || {}) => {
    // 加载专柜列表数据
    this.loadBrandList(options.sort)
  }
  loadBrandList = sort => {
    const startTime = Date.now()

    let that = this
    let brandPageData = []

    fetchData(constant.brand)

    /**
     * 请求数据
     */
    function fetchData(url) {
      util.request({
        url: url,
        hasToken: false,
        success: function(data) {
          brandPageData = brandPageData.concat(data.results)
          if (data.next != null) {
            fetchData(data.next)
          } else {
            // 初始品牌数据
            that.data.brandList = that.cleanBrandData(brandPageData)
            that.initBrandList(sort)

            const endTime = Date.now()
            console.log('====> 初始化时间：', endTime - startTime)
          }
        }
      })
    }
  }
  cleanBrandData = data => {
    // 楼层默认值
    const floorDefault = {
      deleted: false,
      desc: '',
      floor_num: '1',
      id: 0,
      name: '1F'
    }

    let tempData = []
    data.forEach(brand => {
      // 如果没有shop，有可能是撤柜了，但是有缓存
      if (brand.shop) {
        // 将 floor 楼层数据提前一层，楼层数据 floor === null 时，赋默认值
        brand.floor = brand.shop.floor || floorDefault

        let processImage = brand.logo

        if (util.needPrecssImage(processImage)) {
          processImage = processImage + constant.imageSuffix.squareXS
        }

        tempData.push({
          id: brand.id,
          logo: processImage,
          name: brand.name,
          name_en: brand.name_en,
          name_pinyin: brand.name_pinyin,
          location:
            brand.floor.name +
            ' ' +
            (brand.shop.location ? brand.shop.location : ''),
          categories: util.getCategories(brand.categories)
        })
      }
    })

    return tempData
  }
  componentDidMount = () => {}
  initBrandList = sort => {
    const requestStart = Date.now()

    Taro.showLoading({
      title: '加载中...'
    })

    let { brand, letterData, letter, brandList } = this.data
    let brandObj = Object.create(null)

    brandList.forEach(brand => {
      let charIndex
      // 按英文
      if (sort === 'en') {
        charIndex = brand.name_en.charAt(0).toUpperCase()
      }
      // else if (sort === 'zh') { 按中文
      else {
        charIndex = brand.name_pinyin.charAt(0).toUpperCase()
      }

      // 如果不为空
      if (charIndex != null && charIndex !== '') {
        // 将不是英文字母的字符放在 # 中 charCodeAt A = 65 Z = 90
        if (charIndex.charCodeAt() < 65 || charIndex.charCodeAt() > 90) {
          charIndex = '#'
        }
      } else {
        charIndex = '#'
      }

      if (brandObj[charIndex]) {
        brandObj[charIndex].push(brand)
      } else {
        brandObj[charIndex] = [brand]
      }
    })

    // 转为字母数组
    let letterList = Object.keys(brandObj).map(key => {
      return key
    })

    // 排序
    letterList.sort((a, b) => {
      return a.charCodeAt() - b.charCodeAt()
    })
    // 如果第一个是 # ，将 # 放在数组最后
    if (letterList[0] === '#') {
      let shiftChar = letterList.shift()
      letterList.push(shiftChar)
    }

    // letterList.unshift('TOP');
    // 初始化品牌列表和字母列表
    let letterArr = []
    let brandLetterData
    let prevBrandLetterData
    let brandTop = 0
    let brandHeightFirst = 0
    let brandData = []
    let item, prevItem

    for (let i = 0, len = letterList.length; i < len; i++) {
      item = letterList[i]
      brandLetterData = brandObj[item]
      if (i > 0) {
        prevItem = letterList[i - 1]
        prevBrandLetterData = brandObj[prevItem]
        brandTop =
          brandTop +
          prevBrandLetterData.length * brand.height +
          brand.headHeight
      }
      let brandTop2 =
        brandTop + brandLetterData.length * brand.height + brand.headHeight

      // 初始化品牌列表
      brandData.push({
        letter: item,
        data: brandLetterData,
        top: brandTop
      })
      // 初始化字母列表
      letterArr.push({
        y: letter.top + i * letter.height,
        top: brandTop,
        top2: brandTop2,
        value: item
      })
    }

    // this.data.brandData = brandData;
    this.setData({
      brandData,
      letterData: letterArr,
      letterValue: letterArr.length > 0 ? letterArr[0].value : '',
      isLoading: false
    })

    Taro.hideLoading()

    const requestEnd = Date.now()
    console.log('----> 字母排序时间：', requestEnd - requestStart)
  }
  handleLetterTouchStart = event => {
    let { letter, brandData, mouse } = this.data
    mouse.y = event.touches[0].clientY
    let letterHeight = this.data.letter.height
    let letterData = this.data.letterData
    let item,
      y = mouse.y

    for (let i = 0, len = letterData.length; i < len; i++) {
      item = letterData[i]
      if (y >= item.y && y < item.y + letterHeight) {
        this.setData({
          letterValue: item.value,
          top: item.y - (letter.tipHeight - letterHeight) / 2,
          scrollTop: item.top,
          showValue: true,
          isLetter: true
        })
      }
    }
  }
  handleLetterTouchMove = event => {
    const requestStart = Date.now()

    let y = event.touches[0].clientY
    let { letter, brandData, mouse } = this.data
    let letterHeight = this.data.letter.height
    let letterData = this.data.letterData
    let item

    // 判断拖动距离，控制循环触发次数
    if (Math.abs(y - mouse.y) >= letter.height) {
      mouse.y = y

      for (let i = 0, len = letterData.length; i < len; i++) {
        item = letterData[i]
        if (y >= item.y && y < item.y + letterHeight) {
          this.setData({
            letterValue: item.value,
            top: item.y - (letter.tipHeight - letterHeight) / 2,
            scrollTop: item.top,
            showValue: true,
            isLetter: true
          })
        }
      }
    }

    const requestEnd = Date.now()
    console.log('----> 字母拖动时间：', requestEnd - requestStart)
  }
  handleHideShowValue = () => {
    let that = this
    this.data.isLetterEvent = false
    setTimeout(() => {
      that.setData({
        showValue: false,
        isLetter: false
      })
    }, 100)
  }
  brandListScroll = event => {
    const requestStart = Date.now()

    if (this.data.isLetter) {
      return
    }

    let scrollTopCurrent = event.detail.scrollTop
    let { letterData, brand, isScroll } = this.data
    let scrollTop = scrollTopCurrent + brand.headHeight
    let currentItem

    if (Math.abs(scrollTop - this.data.scrollTop) >= 100) {
      this.data.scrollTop = scrollTop

      for (let i = 0, len = letterData.length; i < len; i++) {
        currentItem = letterData[i]
        if (scrollTop >= currentItem.top && scrollTop < currentItem.top2) {
          if (!currentItem.isSet) {
            currentItem.isSet = true
            this.setData({
              letterValue: currentItem.value
            })
          }
        } else {
          currentItem.isSet = false
        }
      }
    }

    const requestEnd = Date.now()
    console.log('----> 滚动时间：', requestEnd - requestStart)
  }
  handleSortZH = () => {
    this.initBrandList('zh')
    this.setData({
      scrollTop: 0,
      tabIndex: 0
    })
  }
  handleSortEN = () => {
    this.initBrandList('en')
    this.setData({
      scrollTop: 0,
      tabIndex: 1
    })
  }
  config = {
    enablePullDownRefresh: false
  }

  render() {
    const {
      tabIndex: tabIndex,
      scrollTop: scrollTop,
      brand: brand,
      brandData: brandData,
      letterValue: letterValue,
      brandTop: brandTop,
      isLoading: isLoading,
      letter: letter,
      top: top,
      showValue: showValue,
      letterData: letterData
    } = this.state
    return (
      <Block>
        <View className="letter-head clearfix">
          <View
            className={'letter-head-item ' + (tabIndex === 0 ? 'current' : '')}
            onClick={this.handleSortZH}
          >
            按拼音首字母
          </View>
          <View
            className={'letter-head-item ' + (tabIndex === 1 ? 'current' : '')}
            onClick={this.handleSortEN}
          >
            按英文首字母
          </View>
        </View>
        {/*  catchtouchstart="scrollViewTouchStart" catchtouchend="scrollViewTouchEnd"  */}
        <ScrollView
          onScroll={this.brandListScroll}
          scrollTop={scrollTop}
          scrollY
          className="brand-box"
        >
          {brandData.map((letterItem, index) => {
            return (
              <View
                className="brand-list-item"
                style={'padding-top: ' + brand.headHeight + 'px;'}
                key={'brand-letter-' + letterItem.letter}
              >
                <View
                  className={
                    'brand-head ' +
                    (letterValue === letterItem.letter ? 'current' : '')
                  }
                  style={'top: ' + brandTop + 'px;'}
                  style={'height: ' + brand.headHeight + 'px;'}
                >
                  {letterItem.letter}
                </View>
                {/* 列表项开始 */}
                {letterItem.data.map((item, index) => {
                  return (
                    <Navigator
                      key={'brand-letter-list-' + index}
                      url={'/pages/brand/detail/detail?id=' + item.id}
                      style={'height: ' + brand.height + 'px;'}
                      className="weui-media-box weui-media-box_appmsg brand-item"
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
                        <View className="weui-media-box__desc mt30">
                          <Text>{item.categories}</Text>
                        </View>
                      </View>
                    </Navigator>
                  )
                })}
                {/* 列表项结束 */}
              </View>
            )
          })}
          {isLoading ? (
            <View className="brand-nomore pt30 pb30">加载中...</View>
          ) : (
            <View className="brand-nomore pt30 pb30">没有更多了</View>
          )}
        </ScrollView>
        {/*  字母导航  */}
        <View
          className="letter-box"
          style={'padding-top: ' + letter.top + 'px;'}
          onTouchEnd={this.handleHideShowValue}
          onTouchStart={this.handleLetterTouchStart}
          onTouchMove={this.handleLetterTouchMove}
        >
          <View
            className="letter-show-value"
            style={
              'top: ' +
              top +
              'px; height: ' +
              letter.tipHeight +
              'px; display: ' +
              (showValue ? 'block' : 'none') +
              ';'
            }
          >
            <Text>{letterValue}</Text>
            <I className="sparrow-icon icon-cursor"></I>
          </View>
          {/*  <view class="letter-item" data-value="search" draggable="true">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               <i class="sparrow-icon icon-santiao" />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             </view>  */}
          {letterData.map((item, index) => {
            return (
              <Block key={'letter-key-' + index}>
                {item.value !== 'TOP' ? (
                  <View
                    data-y={item.y}
                    data-value={item.value}
                    className={
                      'letter-item ' +
                      (letterValue === item.value ? 'current' : '')
                    }
                  >
                    {item.value}
                  </View>
                ) : (
                  <View
                    data-y={item.y}
                    data-value={item.value}
                    className={
                      'letter-item ' +
                      (letterValue === item.value ? 'current' : '')
                    }
                  >
                    <I className="sparrow-icon icon-santiao"></I>
                  </View>
                )}
              </Block>
            )
          })}
        </View>
      </Block>
    )
  }
}

export default _C
