import {
  Block,
  View,
  Navigator,
  Image,
  Text,
  Icon,
  Input,
  Label,
  Button
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
//index.js
import util from '../../../utils/util.js'
import constant from '../../../config/constant.js'
import searchbar from './searchbar/searchbar.js'
import sortConfig from './sort/sort.js'
import floorConfig from './floor/floor.js'
import classifyConfig from './classify/classify.js'

import BrandListItemTmpl from '../../../imports/BrandListItemTmpl.js'
import './index.scss'
const app = Taro.getApp()
let pageConfig = {
  /**
   * 页面的初始数据
   */
  data: {
    // 品牌总数据，搜索源数据
    brandList: [],
    // 搜索、排序等的结果集
    resultList: [],
    // 页面上显示的数据 - 在list插件中
    brandListItemData: [],
    // 每页显示的条数，默认10条
    pageSize: 10,
    // 当前页数
    pageCurrent: 1,
    // 加载中
    isLoading: true,
    // touch start
    startClientY: 0,
    startClientX: 0,
    searchBarIsFixed: true,
    // letter
    letterValue: '',
    letterData: [],
    // 显示/隐藏
    pulldown: {
      showSort: false,
      showClassify: false,
      showFloor: false
    },
    tabbar: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(util.getOptionsByQRCode('https://sparrow.dongyouliang.com/wx-app/brandlist?floor=7&floor=8'));
    if (options.q) {
      options = util.getOptionsByQRCode(options.q)
    }
    // 加载专柜列表数据
    this.loadBrandList(options)
    // app.changeTabBar();
  },

  /**
   * 加载专柜列表
   */
  loadBrandList: function(options) {
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
            that.initBrandList(brandPageData, options)
          }
        }
      })
    }
  },

  /**
   * 初始品牌数据
   */
  initBrandList: function(data, options) {
    // 楼层默认值
    const floorDefault = {
      deleted: false,
      desc: '',
      floor_num: '1',
      id: 0,
      name: '1F'
    }

    let brandList = []
    data.forEach(brand => {
      // 如果没有shop，有可能是撤柜了，但是有缓存
      if (brand.shop) {
        // 将 floor 楼层数据提前一层，楼层数据 floor === null 时，赋默认值
        brand.floor = brand.shop.floor || floorDefault

        let processImage = brand.logo

        if (util.needPrecssImage(processImage)) {
          processImage = processImage + constant.imageSuffix.squareXS
        }

        // 清洗掉无用数据
        const result = {
          id: brand.id,
          // 初始化logo
          logo: processImage,
          logo_code: brand.logo_code,
          name: brand.name,
          name_en: brand.name_en,
          name_pinyin: brand.name_pinyin,
          location:
            brand.floor.name +
            ' ' +
            (brand.shop.location ? brand.shop.location : ''),
          floor: brand.floor, // 用于楼层搜索
          // 电话
          contact: brand.shop.contact,
          is_new: brand.is_new,
          product_quantity: brand.product_quantity,
          // floor: brand.floor,
          // 初始化分类
          categoryStr: util.getCategories(brand.categories),
          categories: brand.categories, // 用于分类搜索
          // 初始化搜索字符串
          searchList: [brand.name, brand.name_en, brand.name_pinyin].concat(
            brand.search_attrs
          ),
          rank: brand.rank,
          rank_xx: brand.rank_xx,
          status: brand.status
        }

        brandList.push(result)
      }
    })

    // 默认赋值 列表总数据，搜索、排序结果集
    this.data.brandList = this.data.resultList = this.sortByHot(brandList)

    // 设置页面中显示的数据，前端分页
    this.setData({
      brandListItemData: brandList.slice(0, this.data.pageSize)
    })

    this.searchBrandByUrl(options)
  },

  // 转发后保存搜索结果
  searchBrandByUrl: function(options) {
    // 使用关键字查询
    if (options.keyWord && options.keyWord.length > 0) {
      this.searchBrandByKeyWord(options.keyWord)
    }

    // 使用楼层筛选
    if (options.floor && options.floor.length > 0) {
      this.floor_searchBrandByFloor(options.floor, options.floorValue)
    }

    // 使用分类搜索
    if (options.id && options.name) {
      // 分类数据
      const classify = {
        name: options.name,
        type: options.type || 'id',
        id: options.id
      }
      this.classify_searchBrandOptions(classify)
    }
  },

  /**
   * 列表
   */
  list_handleMakePhoneCall: function(e) {
    const phone = e.currentTarget.dataset.phone
    Taro.makePhoneCall({
      //  + ',13691204807'
      phoneNumber: phone,
      success: res => {
        console.log('--->success:', res, phone)
      },
      fail: err => {
        console.log('--->fail', err, phone)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 获取分类数据
    this.classify_getBrandCategories()
    // 获取楼层数据
    this.floor_getFloors()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    util.printLog('wechat_app', 'go_to_brand', '')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let { resultList, brandListItemData, pageCurrent, pageSize } = this.data
    // 如果结果集的数组长度 <= 当前显示的条数
    if (resultList.length <= pageCurrent * pageSize) {
      return
    }

    let pageNext = pageCurrent + 1
    this.data.pageCurrent = pageNext

    this.setData({
      brandListItemData: resultList.slice(0, pageNext * pageSize),
      isLoading: resultList.length > pageNext * pageSize
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const obj_GIO = {
      sharePage_var: '品牌列表'
    }
    GIO_utils.send_track_function('shareSuccess', obj_GIO)

    const url_options = {
      channel: '小程序分享',
      pageName: '品牌列表'
    }
    let new_url = util.return_current_url_with_options(url_options)

    return {
      path: new_url
    }
  },

  /**
   * 隐藏弹框
   */
  hideFilterNode: function() {
    this.setData({
      pulldown: {
        showSort: false,
        showClassify: false,
        showFloor: false
      }
    })
  },

  /**
   * 按热度排序
   */
  sortByHot: function(data) {
    data.sort((a, b) => {
      return b.rank_xx - a.rank_xx
    })

    return data
  }
}

const assignedObject = util.assignObject(
  pageConfig,
  searchbar,
  sortConfig,
  floorConfig,
  classifyConfig
)

@withWeapp('Page', assignedObject)
class _C extends Taro.Component {
  config = {
    navigationBarTitleText: '店内品牌',
    enablePullDownRefresh: false
  }

  render() {
    const {
      brandListItemData: brandListItemData,
      list_handleMakePhoneCall: list_handleMakePhoneCall,
      isLoading: isLoading,
      pulldown: pulldown,
      search: search,
      floor: floor,
      index: index,
      item: item,
      classify: classify
    } = this.state
    return (
      <Block>
        {/*  <import src="../../../component/tabbar/tabbar.wxml" />  */}
        {/* <scroll-view class="page" scroll-y bindscroll="scroll" bindscrolltolower="lower"> */}
        {/*  bindtouchstart="handleTouchStart" bindtouchend="handleTouchEnd"  */}
        <View className="page">
          {/*  style="top: {{ searchBarIsFixed ? '0' : '-44px' }}"  */}
          <View className="fixed-box">
            <View className="weui-search-bar">
              <View className="weui-search-bar__form">
                <View className="weui-search-bar__box">
                  <Icon
                    className="weui-icon-search_in-box"
                    type="search"
                    size="14"
                  ></Icon>
                  <View className="classname">
                    <Input
                      fixed="true"
                      type="text"
                      className="weui-search-bar__input"
                      placeholder="搜索专柜名称或关键词"
                      value={search.inputVal}
                      focus={search.inputShowed}
                      onInput={this.search_inputTyping}
                    ></Input>
                  </View>
                  {search.inputVal.length > 0 && (
                    <View
                      className="weui-icon-clear"
                      onClick={this.search_clearInput}
                    >
                      <Icon type="clear" size="14"></Icon>
                    </View>
                  )}
                </View>
                <Label
                  className="weui-search-bar__label"
                  hidden={search.inputShowed}
                  onClick={this.search_showInput}
                >
                  <Icon
                    className="weui-icon-search"
                    type="search"
                    size="14"
                  ></Icon>
                  <View className="weui-search-bar__text">
                    搜索专柜名称或关键词
                  </View>
                </Label>
              </View>
              <View
                className="weui-search-bar__cancel-btn"
                hidden={!search.inputShowed}
                onClick={this.search_hideInput}
              >
                取消
              </View>
            </View>
            {/* 排序、分类、楼层 */}
            <View className="filter clearfix">
              {/*  <include src="sort/sort.wxml" />  */}
              {/* 楼层 */}
              <Block>
                <View className="floor-box">
                  <View
                    className={
                      'filter-text-box ' + (pulldown.showFloor ? 'current' : '')
                    }
                  >
                    <View
                      className="floor-text"
                      onClick={this.floor_handleToggleFloor}
                    >
                      {floor.value}
                    </View>
                    <I
                      className={
                        'sparrow-icon ' +
                        (pulldown.showFloor ? 'icon-arrows-top' : 'icon-unfold')
                      }
                    ></I>
                  </View>
                </View>
                <View
                  className="floor-container"
                  style={'display: ' + (pulldown.showFloor ? 'block' : 'none')}
                >
                  <View className="floor-head">
                    楼层选择：<Text>(可多选)</Text>
                  </View>
                  <View className="floor-list clearfix">
                    {floor.data.map((item, index) => {
                      return (
                        <View
                          data-index={index}
                          onClick={this.floor_handleSelectFloor}
                          className={
                            'floor-item ' + (item.isSelected ? 'current' : '')
                          }
                          key={'brand-floor-' + index}
                        >
                          {item.name + ' ' + item.desc}
                        </View>
                      )
                    })}
                  </View>
                  <View className="floor-btn clearfix">
                    <Button
                      className="sparrow-btn sparrow-btn-reset"
                      onClick={this.floor_handleResetFloor}
                    >
                      重置
                    </Button>
                    <Button
                      className="sparrow-btn sparrow-btn-confirm"
                      onClick={this.floor_handleConfirmFloor}
                    >
                      确定
                    </Button>
                  </View>
                </View>
              </Block>
              {/* 分类 */}
              <Block>
                <View className="floor-box">
                  <View
                    className={
                      'filter-text-box ' +
                      (pulldown.showClassify ? 'current' : '')
                    }
                  >
                    <View
                      className="floor-text"
                      onClick={this.classify_handleTaggleClassify}
                    >
                      {classify.value}
                    </View>
                    <I
                      className={
                        'sparrow-icon ' +
                        (pulldown.showClassify
                          ? 'icon-arrows-top'
                          : 'icon-unfold')
                      }
                    ></I>
                  </View>
                </View>
                <View
                  className="classify-container clearfix"
                  style={
                    'display: ' + (pulldown.showClassify ? 'block' : 'none')
                  }
                >
                  <View className="classify-first">
                    {classify.data.map((item, index) => {
                      return (
                        <View
                          className={
                            'classify-first-item ' +
                            (index === classify.index ? 'current' : '')
                          }
                          key={'classify-pid-' + index}
                          data-id={item.id}
                          data-index={index}
                          onClick={this.classify_handleParentClick}
                        >
                          {item.name}
                        </View>
                      )
                    })}
                  </View>
                  <View className="classify-second">
                    <View className="classify-second-list">
                      <View
                        style={
                          'display: ' +
                          (classify.index === 0 ? 'none' : 'block') +
                          ';'
                        }
                        className="classify-second-item"
                        data-id={classify.item.id}
                        data-name={classify.item.name}
                        data-type="pid"
                        onClick={this.classify_handleGetSortData}
                      >
                        全部<Text>{classify.item.brands_count}</Text>
                      </View>
                      {/* 分类 */}
                      {classify.item.children.map((item, index) => {
                        return (
                          <View
                            className="classify-second-item"
                            key={'classify-item-' + index}
                            data-id={item.id}
                            data-name={item.name}
                            data-type="id"
                            onClick={this.classify_handleGetSortData}
                          >
                            {item.name}
                            <Text>{item.brands_count}</Text>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </View>
              </Block>
              {/*  字母排序  */}
              <View className="floor-box filter-letter-box">
                <Navigator
                  className="letter-text"
                  url="/pages/brand/letter/letter?sort=zh"
                >
                  A-Z<I className="sparrow-icon icon-enter"></I>
                </Navigator>
              </View>
            </View>
          </View>
          {/* 列表 */}
          <View className="brand-list">
            <BrandListItemTmpl
              data={{
                brandListItemData: (brandListItemData, list_handleMakePhoneCall)
              }}
            ></BrandListItemTmpl>
          </View>
          {/* 没有更多了 */}
          {isLoading ? (
            <View className="brand-nomore pt30 pb40">加载中...</View>
          ) : brandListItemData.length <= 0 ? (
            <View className="brand-nomore pt30 pb40">没有符合的结果</View>
          ) : (
            <View className="brand-nomore pb40">没有更多了</View>
          )}
        </View>
        {/* </scroll-view> */}
        {(pulldown.showClassify || pulldown.showFloor || pulldown.showSort) && (
          <View className="mask" onClick={this.hideFilterNode}></View>
        )}
      </Block>
    )
  }
}

export default _C
