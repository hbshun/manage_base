import { Block, View, Icon, Input, Label, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
// pages/index/module/searchPage/searchPage.js
import util from '../../utils/util.js'
import constant from '../../config/constant.js'
import user from '../../utils/user/index.js'

import './searchPage.scss'

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    shopShow: true, // 列表显示
    inputShowed: true, // 搜索栏
    inputVal: '', // 搜索栏上填写的数据
    hotHistoryKeyList: [], // 热门搜索历史列表
    historyList: [] // 搜索历史列表
  }
  componentDidMount = () => {
    this.showInput()
    this.judgeTokenStatus()
    this.getHotSearchKey()
  }
  componentDidShow = () => {
    // util.printLog('wechat_app', 'search', '');
  }
  showInput = () => {
    this.setData({
      inputShowed: true
    })
  }
  hideInput = () => {
    this.setData({
      inputVal: '',
      inputShowed: false
    })
  }
  clearInput = () => {
    this.setData({
      inputVal: ''
    })
  }
  inputTyping = e => {
    this.setData({
      inputVal: e.detail.value
    })
  }
  searchSend = () => {
    const value = this.data.inputVal
    Taro.redirectTo({
      url: '/packageA/product/list/list?key=' + value
    })
  }
  judgeTokenStatus = () => {
    util.judgeTokenStatus(
      res => {
        this.getSearchHistory()
      },
      () => {}
    )
  }
  getSearchHistory = () => {
    const _this = this

    util.request({
      url: constant.getSearchHistory + '?page_size=10',
      method: 'GET',
      success: function(data) {
        if (data.results.length > 0) {
          let historyList = []
          for (let i = 0; i < data.results.length; i++) {
            historyList.push(data.results[i].keyword)
          }
          _this.setData({
            historyList
          })
        }
      }
    })
  }
  showModalError = message => {
    Taro.showModal({
      title: '错误提示',
      content: message,
      showCancel: false
    })
  }
  clickClearHistory = () => {
    const _this = this
    Taro.showModal({
      title: '提示',
      content: '确定删除全部历史记录？',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          _this.clearHistoryList()
        }
      }
    })
  }
  clearHistoryList = () => {
    const _this = this

    util.request({
      url: constant.getSearchHistory,
      method: 'DELETE',
      success: function() {
        _this.setData({
          historyList: []
        })
      },
      fail: error => {
        // 调用失败函数
        _this.showModalError('网络不给力，请检查网络设置')
      }
    })
  }
  getHotSearchKey = () => {
    const _this = this
    util.request({
      url: constant.getHotSearchKey + '?page_size=20',
      method: 'GET',
      hasToken: false,
      success: function(res) {
        if (res.results.length > 0) {
          const hotHistoryKeyList = []
          for (let i = 0; i < res.results.length; i++) {
            hotHistoryKeyList.push(res.results[i].keyword)
          }

          _this.setData({
            hotHistoryKeyList
          })
        }
      }
    })
  }
  clickHistoryText = e => {
    console.log(e)
    const value = e.currentTarget.dataset.value
    Taro.redirectTo({
      url: '/packageA/product/list/list?key=' + value
    })
  }
  config = {
    enablePullDownRefresh: false
  }

  render() {
    const {
      inputVal: inputVal,
      inputShowed: inputShowed,
      search_bar_form: search_bar_form,
      historyList: historyList,
      hotHistoryKeyList: hotHistoryKeyList
    } = this.state
    return (
      <View>
        <View className="weui-search-bar search-big-div">
          <View className="weui-search-bar__form">
            <View className="weui-search-bar__box list-page">
              <Icon
                className="weui-icon-search_in-box"
                type="search"
                size="14"
              ></Icon>
              <Input
                type="text"
                className="weui-search-bar__input"
                value={inputVal}
                focus={inputShowed}
                onInput={this.inputTyping}
                onConfirm={this.searchSend}
                confirmType="search"
              ></Input>
              {inputVal.length > 0 && (
                <View className="weui-icon-clear" onClick={this.clearInput}>
                  <Icon type="clear" size="14"></Icon>
                </View>
              )}
            </View>
            <Label
              className="weui-search-bar__label searchModule"
              hidden={inputShowed}
              onClick={this.showInput}
              style={
                'background-color:' +
                search_bar_form.background +
                '; color:' +
                search_bar_form.color
              }
            >
              <Icon className="sparrow-icon icon-search"></Icon>
              <View className="weui-search-bar__text">搜索</View>
            </Label>
          </View>
          {/*  <view class="weui-search-bar__cancel-btn" hidden="{{!inputShowed}}" bindtap="hideInput">取消</view>  */}
          {/*  <input focus="{{true}}"></input>  */}
        </View>
        {historyList.length > 0 ? (
          <View className="search-view">
            <View className="search-view-title">
              <Text className="title-left">搜索历史</Text>
              <Text className="title-right" onClick={this.clickClearHistory}>
                清除
              </Text>
            </View>
            <View className="search-view-content">
              {historyList.map((item, index) => {
                return (
                  <View
                    className="search-content-piece"
                    key={'history-list-' + index}
                    data-value={item}
                    onClick={this.clickHistoryText}
                  >
                    {item}
                  </View>
                )
              })}
            </View>
          </View>
        ) : (
          historyList.length == 0 && (
            <View className="search-view">
              <View className="search-view-title">
                <Text className="title-left">搜索历史</Text>
              </View>
              <View className="empty-search-view-content">暂无搜索历史</View>
            </View>
          )
        )}
        {hotHistoryKeyList.length > 0 && (
          <View className="hot search-view">
            <View className="search-view-title">
              <Text className="title-left">热门搜索</Text>
              {/*  <text class='title-right'>换一批</text>
                                                                                                                                                                                                                                                                                                                                                                                                 <text class='sparrow-icon icon-search-change title-right'></text>  */}
            </View>
            {hotHistoryKeyList.length > 0 && (
              <View className="search-view-content">
                {hotHistoryKeyList.map((item, index) => {
                  return (
                    <View
                      key={'hot-history-list-' + index}
                      className="search-content-piece"
                      data-value={item}
                      onClick={this.clickHistoryText}
                    >
                      {item}
                    </View>
                  )
                })}
              </View>
            )}
          </View>
        )}
      </View>
    )
  }
}

export default _C
