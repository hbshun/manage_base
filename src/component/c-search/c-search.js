import { Block, View, Input, Icon, Label } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './c-search.scss'

@withWeapp('Component')
class _C extends Taro.Component {
  _observeProps = []
  state = {
    shopShow: true, // 列表显示
    inputShowed: false, // 搜索栏
    inputVal: '', // 搜索栏上填写的数据
    searchBigDiv: {
      background: 'rgba(255,255,255,0)', // rgba(255,255,255,0) -> rgba(255,255,255,1)
      padding: '206rpx' // 206rpx -> 60rpx
    },
    searchBarForm: {
      color: 'rgb(255, 255, 255)', // rgb(255, 255, 255) -> rgb(69, 69, 69)
      background: 'rgba(0, 0, 0, 0.3)' // rgba(0, 0, 0, 0.3) -> rgba(238, 238, 238, 1)
    }
  }
  static externalClasses = ['icon-search']
  showInput = () => {
    Taro.navigateTo({
      url: this.data.url
    })
  }
  scrollPageChangeSearch = scrollTop => {
    let { searchBigDiv, searchBarForm } = this.data

    if (scrollTop <= 16) {
      searchBigDiv.background = 'rgba(255, 255, 255, 0)'
      searchBigDiv.padding = '206rpx'
      searchBarForm.color = 'rgb(255, 255, 255)'
      searchBarForm.background = 'rgba(0, 0, 0, 0.3)'
    } else if (scrollTop <= 32) {
      searchBigDiv.background = 'rgba(255, 255, 255, 0.2)'
      searchBigDiv.padding = '176rpx'
      searchBarForm.color = 'rgb(218, 218, 218)'
      searchBarForm.background = 'rgba(48, 48, 48, 0.4)'
    } else if (scrollTop <= 48) {
      searchBigDiv.background = 'rgba(255, 255, 255, 0.4)'
      searchBigDiv.padding = '146rpx'
      searchBarForm.color = 'rgb(181, 181, 181)'
      searchBarForm.background = 'rgba(96, 96, 96, 0.5)'
    } else if (scrollTop <= 64) {
      searchBigDiv.background = 'rgba(255, 255, 255, 0.6)'
      searchBigDiv.padding = '116rpx'
      searchBarForm.color = 'rgb(144, 144, 144)'
      searchBarForm.background = 'rgba(144, 144, 144, 0.6)'
    } else if (scrollTop <= 80) {
      searchBigDiv.background = 'rgba(255, 255, 255, 0.8)'
      searchBigDiv.padding = '86rpx'
      searchBarForm.color = 'rgb(107, 107, 107)'
      searchBarForm.background = 'rgba(192, 192, 192, 0.7)'
    } else {
      searchBigDiv.background = 'rgba(255, 255, 255, 1)'
      searchBigDiv.padding = '60rpx'
      searchBarForm.color = 'rgb(69, 69, 69)'
      searchBarForm.background = 'rgba(238, 238, 238, 1)'
    }

    this.setData({
      searchBigDiv,
      searchBarForm
    })
  }
  config = {
    component: true
  }

  render() {
    const { placeholder: placeholder, url: url } = this.props
    const {
      searchBigDiv: searchBigDiv,
      searchBarForm: searchBarForm,
      inputVal: inputVal,
      inputShowed: inputShowed
    } = this.state
    return (
      <Csearch>
        <View
          className="weui-search-bar search-big-div"
          style={
            'background-color:' +
            searchBigDiv.background +
            ';padding-left:' +
            searchBigDiv.padding +
            '; padding-right:' +
            searchBigDiv.padding
          }
        >
          <View
            className="weui-search-bar__form"
            style={'background:transparent; color:' + searchBarForm.color}
          >
            <View className="weui-search-bar__box list-page">
              <Input
                type="text"
                className="weui-search-bar__input"
                value={inputVal}
                focus={inputShowed}
                onInput={this.inputTyping}
                onConfirm={this.searchSend}
                confirmType="send"
              ></Input>
              {inputVal.length > 0 && (
                <View className="weui-icon-clear" onClick={this.clearInput}>
                  <Icon type="clear" size="14"></Icon>
                </View>
              )}
            </View>
            <Label
              className="weui-search-bar__label search-module sparrow-icon-search"
              hidden={inputShowed}
              onClick={this.showInput}
              style={
                'background-color:' +
                searchBarForm.background +
                '; color:' +
                searchBarForm.color
              }
            >
              <Icon className="icon-search sparrow-icon-search-icon"></Icon>
              <View className="weui-search-bar__text">
                {placeholder ? placeholder : '搜索'}
              </View>
            </Label>
          </View>
        </View>
      </Csearch>
    )
  }
} // component/c-search/c-search.js

export default _C
